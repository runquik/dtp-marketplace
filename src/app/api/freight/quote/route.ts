import { NextRequest, NextResponse } from 'next/server';

interface QuoteRequest {
  originZip: string;
  destZip: string;
  quantityLbs: number;
  freightMode: 'LTL' | 'FTL';
  tempClass: 'ambient' | 'reefer';
}

async function geocodeZip(zip: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude) };
  } catch { return null; }
}

async function getRoadMiles(
  orig: { lat: number; lon: number },
  dest: { lat: number; lon: number },
): Promise<number | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${orig.lon},${orig.lat};${dest.lon},${dest.lat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const meters = data.routes?.[0]?.distance;
    if (meters == null) return null;
    return meters / 1609.344; // → miles
  } catch { return null; }
}

function estimateMiles(zip1: string, zip2: string): number {
  // Rough fallback: zip prefix difference as a very crude distance proxy
  const diff = Math.abs(parseInt(zip1.slice(0, 3)) - parseInt(zip2.slice(0, 3)));
  return Math.max(50, diff * 8 + 100);
}

export async function POST(req: NextRequest) {
  const body: QuoteRequest = await req.json();
  const { originZip, destZip, quantityLbs, freightMode, tempClass } = body;

  const [orig, dest] = await Promise.all([geocodeZip(originZip), geocodeZip(destZip)]);

  let miles: number;
  if (orig && dest) {
    miles = (await getRoadMiles(orig, dest)) ?? estimateMiles(originZip, destZip);
  } else {
    miles = estimateMiles(originZip, destZip);
  }

  // Rate model
  const baseRatePerMile = freightMode === 'FTL' ? 2.20 : 3.10;
  const reeferMultiplier = tempClass === 'reefer' ? 1.28 : 1.0;
  const rawTotal = miles * baseRatePerMile * reeferMultiplier;
  const totalUsd = Math.max(120, rawTotal);
  const perLbUsd = totalUsd / Math.max(quantityLbs, 1);
  const transitDays = Math.max(1, Math.ceil(miles / 500));

  return NextResponse.json({
    originZip,
    destZip,
    miles: Math.round(miles),
    transitDays,
    totalUsd: Math.round(totalUsd * 100) / 100,
    perLbUsd: Math.round(perLbUsd * 10000) / 10000,
  });
}
