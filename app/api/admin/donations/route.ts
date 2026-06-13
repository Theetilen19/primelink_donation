import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Admin donations error:', error);
        return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
    }
}
