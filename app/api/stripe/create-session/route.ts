// Stripe create-session route removed. Kept as a harmless placeholder to avoid build issues while
// the codebase is refactored. If you want this endpoint gone entirely, remove this file.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ error: 'Stripe integration removed' }, { status: 410 });
}
