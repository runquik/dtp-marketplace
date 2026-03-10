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
    return meters / 1609.344;
  } catch { return null; }
}

function fallbackMiles(zip1: string, zip2: string): number {
  const diff = Math.abs(parseInt(zip1.slice(0, 3)) - parseInt(zip2.slice(0, 3)));
  return Math.max(50, diff * 7 + 80);
}

/**
 * LTL rate model — per lb, based on distance band.
 * Reflects realistic CWT-based LTL market rates for food-grade freight.
 * Source: DAT, FreightQuote industry benchmarks.
 */
function ltlRatePerLb(miles: number, tempClass: 'ambient' | 'reefer'): number {
  let rate: number;
  if      (miles < 150)  rate = 0.08;
  else if (miles < 350)  rate = 0.11;
  else if (miles < 600)  rate = 0.16;
  else if (miles < 1000) rate = 0.22;
  else if (miles < 1500) rate = 0.29;
  else                   rate = 0.37;

  if (tempClass === 'reefer') rate *= 1.28;
  return rate;
}

/**
 * FTL rate model — total truck cost divided by quantity.
 * A standard 53' reefer holds ~44,000 lbs.
 * FTL is only efficient at high quantities.
 */
function ftlTotalUsd(miles: number, tempClass: 'ambient' | 'reefer'): number {
  const ratePerMile = tempClass === 'reefer' ? 2.80 : 2.20;
  return Math.max(400, miles * ratePerMile);
}

export async function POST(req: NextRequest) {
  const body: QuoteRequest = await req.json();
  const { originZip, destZip, quantityLbs, freightMode, tempClass } = body;
  const qty = Math.max(1, quantityLbs);

  const [orig, dest] = await Promise.all([geocodeZip(originZip), geocodeZip(destZip)]);
  let miles: number;
  if (orig && dest) {
    miles = (await getRoadMiles(orig, dest)) ?? fallbackMiles(originZip, destZip);
  } else {
    miles = fallbackMiles(originZip, destZip);
  }

  let totalUsd: number;
  let effectiveMode = freightMode;

  if (freightMode === 'FTL') {
    totalUsd = ftlTotalUsd(miles, tempClass);
  } else {
    // LTL: per-lb rate × quantity, minimum $150
    const ratePerLb = ltlRatePerLb(miles, tempClass);
    totalUsd = Math.max(150, ratePerLb * qty);
  }

  const perLbUsd = totalUsd / qty;
  const transitDays = Math.max(1, Math.ceil(miles / 500));

  return NextResponse.json({
    originZip,
    destZip,
    miles: Math.round(miles),
    transitDays,
    totalUsd: Math.round(totalUsd * 100) / 100,
    perLbUsd: Math.round(perLbUsd * 10000) / 10000,
    mode: effectiveMode,
  });
}
