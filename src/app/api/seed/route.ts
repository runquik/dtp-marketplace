import { NextResponse } from 'next/server';
import { seedOrderbook } from '@/lib/orderbook';

export async function GET() {
  const offers = seedOrderbook(200);
  return NextResponse.json(offers);
}
