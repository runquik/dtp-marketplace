import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// USDA NOP Organic: real public lookup via USDA Organic Integrity Database
// FDA Facility: format validation only (FDA FURLS has no public API)
// All others: accepted as self-attested with expiration tracking
// ---------------------------------------------------------------------------

async function verifyUsdaOrganic(certNumber: string): Promise<{
  valid: boolean; operationName?: string; certifyingAgent?: string;
  effectiveDate?: string; expirationDate?: string; status?: string;
}> {
  try {
    // USDA Organic Integrity Database public search
    const url = `https://apps.ams.usda.gov/nop/api/consumers/search?q=${encodeURIComponent(certNumber)}&type=certnum`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('USDA API unavailable');
    const data = await res.json() as { items?: unknown[] };
    if (data.items && data.items.length > 0) {
      const op = data.items[0] as Record<string, string>;
      return {
        valid: true,
        operationName:  op.operationName,
        certifyingAgent: op.certifyingAgentName,
        effectiveDate:  op.effectiveDate,
        expirationDate: op.expirationDate,
        status:         op.status,
      };
    }
    return { valid: false };
  } catch {
    // USDA API unavailable — fall back to format check
    const valid = /^[A-Z0-9-]{4,20}$/i.test(certNumber.trim());
    return {
      valid,
      status: 'unverified — USDA API unavailable; format accepted',
    };
  }
}

function verifyFdaFacility(regNumber: string): { valid: boolean; note: string } {
  // FDA facility registration numbers are 11 digits
  const digits = regNumber.replace(/\D/g, '');
  const valid = digits.length === 11;
  return {
    valid,
    note: valid
      ? 'Format valid — FDA FURLS has no public API; manual verification pending'
      : 'FDA facility registration numbers must be 11 digits',
  };
}

export async function POST(req: NextRequest) {
  const { certType, certNumber, issuingBody } = await req.json() as {
    certType: string; certNumber: string; issuingBody: string;
  };

  if (!certType || !certNumber) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  if (certType === 'usda_organic') {
    const result = await verifyUsdaOrganic(certNumber);
    return NextResponse.json({ ...result, verifiedByDtp: result.valid });
  }

  if (certType === 'fda_facility') {
    const result = verifyFdaFacility(certNumber);
    return NextResponse.json({ ...result, verifiedByDtp: false });
  }

  // All other cert types: accept as self-attested
  return NextResponse.json({
    valid: certNumber.trim().length >= 3,
    verifiedByDtp: false,
    note: `${issuingBody || certType} — self-attested; DTP will display but cannot auto-verify`,
  });
}
