import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createAdminClient } from '@/lib/supabase';
import Footer from '@/components/Footer';
import { Heart, Zap, Shield, Globe, TrendingUp, Users, ArrowRight, Star, CheckCircle2 } from 'lucide-react';

export default async function HomePage() {
  // Fetch latest totals from the database (server-side)
  let totalRaisedDisplay = 'KSh 0';
  try {
    const supabase = createAdminClient();
    const { data: donations } = await supabase.from('donations').select('amount, status');
    const completed = (donations || []).filter((d: any) => d.status === 'completed');
    const totalRaised = completed.reduce((s: number, d: any) => s + (d.amount || 0), 0);

    // Simple formatting: show in KSh with shorthand for millions/thousands
    function fmt(n: number) {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
      return n.toString();
    }

    totalRaisedDisplay = `KSh ${fmt(totalRaised)}`;
  } catch (err) {
    console.error('Failed to fetch totals for homepage:', err);
  }

  const stats = [
    { label: 'Donors Worldwide', value: '12,000+', icon: Users },
    { label: 'Total Raised', value: totalRaisedDisplay, icon: TrendingUp },
    { label: 'Active Campaigns', value: '24', icon: Zap },
    { label: 'Countries Reached', value: '18', icon: Globe },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'All transactions are protected with industry-standard encryption.',
      color: 'var(--accent-primary)',
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Payments processed in seconds via Stripe or M-Pesa.',
      color: 'var(--accent-secondary)',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Support campaigns from anywhere in the world seamlessly.',
      color: 'var(--accent-tertiary)',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] floating" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] floating" style={{ animationDelay: '-2s' }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-sm font-semibold mb-8 reveal">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-slate-300">Empowering 12,000+ visionaries globally</span>
            </div>

            <h1 className="heading-xl mb-8 reveal" style={{ animationDelay: '0.1s' }}>
              Every Donation <br />
              <span className="gradient-text">Drives Innovation</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto reveal" style={{ animationDelay: '0.2s' }}>
              Support PrimeLink Technologies and help us build solutions that empower communities,
              bridge digital divides, and create lasting impact across East Africa and beyond.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 reveal" style={{ animationDelay: '0.3s' }}>
              <Link href="/donate" className="btn-premium px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl group w-full sm:w-auto">
                <Heart size={20} className="fill-white transition-transform group-hover:scale-110" />
                Empower a Project
                <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
              </Link>
              <Link href="/campaigns" className="btn-outline px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl w-full sm:w-auto">
                View Active Causes
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ===== IMPACT STATS ===== */}
      <section className="py-20 relative border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center reveal" style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="text-3xl md:text-5xl font-black text-white mb-2 font-sans tracking-tight">
                  {s.value}
                </div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="heading-lg mb-6">
                Why choose <span className="gradient-text">PrimeLink Gives?</span>
              </h2>
              <p className="text-slate-400 text-lg">
                We've combined bank-grade security with the convenience of local payment methods
                to create the most transparent donation experience.
              </p>
            </div>
            <Link href="/about" className="text-blue-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              Learn about our transparency <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="glass-premium p-10 rounded-[32px] glass-hover reveal" style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8" style={{ background: `${f.color}20` }}>
                  <f.icon size={28} style={{ color: f.color }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {f.description}
                </p>
                <div className="space-y-3">
                  {['Instant confirmation', 'Tax receipts', 'Secure storage'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS / QUOTE ===== */}
      <section className="py-32 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mx-auto mb-10 rotate-12">
              <Heart size={40} className="text-blue-500 fill-blue-500" />
            </div>
            <blockquote className="text-3xl md:text-4xl font-sans font-medium text-white leading-tight mb-10 italic">
              "PrimeLink Gives has fundamentally changed how we support tech innovation in the region.
              The transparency and ease of M-Pesa integration set a new standard."
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800" />
              <div className="text-left">
                <div className="font-bold text-white text-lg">Dr. Elena Rodriguez</div>
                <div className="text-slate-500">Tech Policy Institute</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CALL TO ACTION ===== */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="glass-premium p-12 md:p-20 rounded-[48px] text-center relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <h2 className="heading-lg mb-8">
                Ready to make <br />
                <span className="gradient-text">a difference today?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
                Your support fuels innovation and helps us reach more people.
                Every contribution matters, no matter the size.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <Link href="/donate" className="btn-premium px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl group w-full sm:w-auto">
                  Make an Impact Now
                  <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block" />
                </Link>
                <Link href="/contact" className="btn-outline px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl w-full sm:w-auto">
                  Become a Partner
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
      <div className="noise" />
    </div>
  );
}
