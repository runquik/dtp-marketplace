import { NextRequest, NextResponse } from 'next/server';

// EIN first-two-digit prefixes that the IRS never issues (as of 2024)
const INVALID_EIN_PREFIXES = new Set(['00', '07', '08', '09', '17', '18', '19', '28', '29',
  '49', '69', '70', '78', '79', '89', '96', '97']);

function validateEinFormat(ein: string): boolean {
  const digits = ein.replace(/\D/g, '');
  if (digits.length !== 9) return false;
  if (INVALID_EIN_PREFIXES.has(digits.slice(0, 2))) return false;
  return true;
}

export async function POST(req: NextRequest) {
  const { ein, legalName, state } = await req.json() as {
    ein: string; legalName: string; state: string;
  };

  if (!ein || !legalName || !state) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const digits = ein.replace(/\D/g, '');

  if (!validateEinFormat(digits)) {
    return NextResponse.json({
      valid: false,
      verifiedEntity: false,
      error: 'EIN format invalid. Must be 9 digits with a valid IRS prefix.',
    });
  }

  // Production path: swap this block for a real Middesk call
  // if (process.env.MIDDESK_API_KEY) {
  //   const mdRes = await fetch('https://api.middesk.com/v1/businesses', {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${process.env.MIDDESK_API_KEY}`, 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ name: legalName, tin: { ein: digits } }),
  //   });
  //   const md = await mdRes.json();
  //   return NextResponse.json({ valid: true, verifiedEntity: md.status === 'approved', details: md });
  // }

  // Dev/demo: simulate a 300ms verification and approve valid-format EINs
  await new Promise(r => setTimeout(r, 300));

  return NextResponse.json({
    valid: true,
    verifiedEntity: true,   // real Middesk would determine this
    einLast4: digits.slice(-4),
    details: {
      legalName,
      state,
      status: 'approved',
      note: 'Simulated — connect MIDDESK_API_KEY for live verification',
    },
  });
}
