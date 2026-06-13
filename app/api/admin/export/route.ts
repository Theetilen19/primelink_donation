import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Convert to CSV
        const headers = [
            'id',
            'donor_name',
            'donor_email',
            'donor_phone',
            'amount',
            'currency',
            'payment_method',
            'transaction_id',
            'campaign_id',
            'status',
            'anonymous',
            'created_at',
        ];

        const csvRows = [
            headers.join(','),
            ...(data || []).map((row) =>
                headers
                    .map((h) => {
                        const key = h as keyof typeof row;
                        const val = row[key] ?? '';
                        return `"${String(val).replace(/"/g, '""')}"`;
                    })
                    .join(',')
            ),
        ];

        const csv = csvRows.join('\n');

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="primelink_donations_${Date.now()}.csv"`,
            },
        });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
