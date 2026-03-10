import { NextRequest, NextResponse } from 'next/server';

// Check if a NEAR account exists on mainnet (or testnet) via the public RPC.
// No keys required — view_account is a read-only query.

const NEAR_RPC = 'https://rpc.mainnet.near.org';
const TESTNET_RPC = 'https://rpc.testnet.near.org';

async function accountExists(accountId: string, rpc: string): Promise<boolean> {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'dtp',
      method: 'query',
      params: {
        request_type: 'view_account',
        finality: 'final',
        account_id: accountId,
      },
    }),
  });
  const json = await res.json() as { error?: unknown; result?: unknown };
  return !json.error && !!json.result;
}

function isValidAccountIdFormat(id: string): boolean {
  // NEAR account IDs: 2-64 chars, lowercase alphanumeric + _ + - + .
  return /^[a-z0-9_-][a-z0-9_.-]{1,63}$/.test(id);
}

export async function POST(req: NextRequest) {
  const { accountId } = await req.json() as { accountId: string };

  if (!accountId) {
    return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });
  }

  if (!isValidAccountIdFormat(accountId)) {
    return NextResponse.json({
      valid: false,
      error: 'Invalid NEAR account ID format. Use lowercase letters, numbers, _, -, and .',
    });
  }

  const isTestnet = accountId.endsWith('.testnet');
  const rpc = isTestnet ? TESTNET_RPC : NEAR_RPC;

  try {
    const exists = await accountExists(accountId, rpc);
    return NextResponse.json({
      valid: exists,
      accountId,
      network: isTestnet ? 'testnet' : 'mainnet',
      error: exists ? undefined : `Account "${accountId}" not found on ${isTestnet ? 'testnet' : 'mainnet'}`,
    });
  } catch {
    return NextResponse.json({
      valid: false,
      error: 'Could not reach NEAR RPC. Try again.',
    });
  }
}
