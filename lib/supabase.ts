import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client (used in browser / client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (server-side only — never expose to browser)
export function createAdminClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export type Database = {
    public: {
        Tables: {
            campaigns: {
                Row: Campaign;
                Insert: Omit<Campaign, 'id' | 'created_at'>;
                Update: Partial<Campaign>;
            };
            donations: {
                Row: Donation;
                Insert: Omit<Donation, 'id' | 'created_at'>;
                Update: Partial<Donation>;
            };
            payment_logs: {
                Row: PaymentLog;
                Insert: Omit<PaymentLog, 'id' | 'created_at'>;
                Update: Partial<PaymentLog>;
            };
        };
    };
};

export type Campaign = {
    id: string;
    title: string;
    description: string;
    target_amount: number;
    raised_amount: number;
    status: 'active' | 'completed' | 'paused';
    created_at: string;
    image_url?: string;
};

export type Donation = {
    id: string;
    donor_name: string;
    donor_email: string;
    donor_phone?: string;
    amount: number;
    currency: string;
            payment_method: 'mpesa' | 'paystack';
    transaction_id: string;
    campaign_id?: string;
    status: 'pending' | 'completed' | 'failed';
    anonymous: boolean;
    created_at: string;
};

export type PaymentLog = {
    id: string;
    donation_id: string;
            provider: 'mpesa' | 'paystack';
    request_payload: Record<string, unknown>;
    response_payload: Record<string, unknown>;
    status: string;
    created_at: string;
};
