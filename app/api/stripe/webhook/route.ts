// Stripe webhook endpoint removed. Return 410 Gone for any incoming requests.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ error: 'Stripe webhook removed' }, { status: 410 });
}
