import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="font-sans selection:bg-[#ff6b4a] selection:text-white bg-[#191919]">
      {/* 
        ========================================
        DARK MODE SECTION (Hero + 3 Cards)
        ========================================
      */}
      <div className="bg-[#191919] text-white min-h-screen pb-20">
        {/* Header */}
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white">
                <div className="h-2.5 w-2.5 rounded-full bg-[#191919]"></div>
              </div>
              <span className="text-[1.35rem] font-bold tracking-tight text-white">Typeform</span>
            </div>
          </div>
          <div>
            <Link
              href="/onboarding"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative mx-auto mt-20 flex max-w-4xl flex-col items-center px-6 text-center">
          <p className="mb-6 text-[0.85rem] font-bold uppercase tracking-[0.1em] text-[#d6b5ff]">
            AI FORMS & WORKFLOWS
          </p>

          <h1 className="mb-8 text-5xl font-medium leading-[1.1] tracking-tight text-white sm:text-6xl md:text-[5.5rem] font-serif">
            The form is only
            <span className="block">the beginning</span>
          </h1>

          <p className="mb-10 max-w-2xl text-[1.1rem] leading-relaxed text-gray-300">
            Collect, analyze, and act on customer data<br />with the complete platform for AI forms & workflows.
          </p>

          <Link
            href="/studio"
            className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-black transition hover:bg-gray-100"
          >
            Get started—it's free
          </Link>
        </section>

        {/* Visual Previews / Cards */}
        <section className="mx-auto mt-24 max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="relative h-[400px] overflow-hidden rounded-[24px] bg-[#1a1525] border border-[#2a2235] p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#9b51e0]/30 via-transparent to-transparent opacity-50 blur-2xl"></div>
              <div className="relative z-10 mb-auto">
                <div className="rounded-2xl bg-white/5 p-5 backdrop-blur-md border border-white/10 text-white shadow-xl">
                  <p className="text-[15px] font-medium leading-relaxed">Build a lead generation form for my business, FitCo <span className="animate-pulse">|</span></p>
                </div>
              </div>
              <div className="relative z-10 mt-8">
                <h3 className="text-2xl font-bold mb-3 text-white">Build forms at the drop of a prompt</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Gain 3.5x more data with expertly-designed forms. Then complete the picture with built-in AI data enrichment.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative h-[400px] overflow-hidden rounded-[24px] bg-[#1a1525] border border-[#2a2235] p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#8b7325]/20 via-[#4a5f25]/10 to-transparent blur-3xl"></div>
              <div className="relative z-10 mb-auto w-full">
                <div className="rounded-xl border border-[#7a6431] bg-[#4a3f15] p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-black/20 blur-md"></div>
                  <div className="text-xs font-semibold mb-6 text-white/70">FitCo</div>
                  <h4 className="text-xl font-bold text-white mb-4">Try similar<br/>HIIT classes:</h4>
                  <div className="space-y-2">
                    <div className="border border-[#7a6431] bg-[#5a4d1a] rounded px-3 py-1.5 text-xs text-white">Power Hour</div>
                    <div className="border border-[#7a6431] bg-transparent rounded px-3 py-1.5 text-xs text-white/70">Total Tone</div>
                    <div className="border border-[#7a6431] bg-transparent rounded px-3 py-1.5 text-xs text-white/70">Cardio Kicks</div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-8">
                <h3 className="text-2xl font-bold mb-3 text-white">Analyze customer data with AI precision</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Compare key differences in form response data. Identify customer segments and growth opportunities.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative h-[400px] overflow-hidden rounded-[24px] bg-[#1a1525] border border-[#2a2235] p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#9b51e0]/10 via-[#4a5f25]/10 to-transparent blur-3xl"></div>
              <div className="relative z-10 mb-auto w-full">
                <div className="rounded-xl border border-[#7a6431] bg-[#544815] p-5 shadow-2xl">
                  <div className="text-xs font-semibold mb-6 text-white/70 flex justify-between">
                    <span>FitCo</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white mb-4">Sign to confirm you're in good health</h4>
                  <div className="h-10 w-full rounded bg-white/20 mb-2 pl-3 flex items-center text-xs text-white/50">Robin Smith</div>
                  <div className="h-8 w-16 rounded bg-[#b2f042] text-black text-xs font-bold flex items-center justify-center">OK</div>
                </div>
              </div>
              <div className="relative z-10 mt-8">
                <h3 className="text-2xl font-bold mb-3 text-white">Act on data with automatic AI workflows</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Act on form data automatically. Segment your customer contacts and send customized follow-up flows.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 
        ========================================
        LIGHT MODE SECTION (Customer Journey)
        ========================================
      */}
      <div className="bg-white text-[#191919] py-24 px-6 relative z-10 rounded-t-[40px] -mt-10">
        <div className="mx-auto max-w-5xl flex flex-col items-center text-center">
          <p className="mb-6 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-[#9b51e0]">
            CUSTOMER JOURNEY
          </p>

          <h2 className="mb-12 text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl font-serif max-w-2xl">
            Collect, analyze, and act on customer data
          </h2>

          {/* Tabs */}
          <div className="w-full border-b border-gray-200 mb-16 flex justify-start gap-8 px-4 text-sm font-medium text-gray-500 overflow-x-auto">
            <button className="pb-4 text-black border-b-2 border-black whitespace-nowrap">Acquire</button>
            <button className="pb-4 hover:text-black whitespace-nowrap transition">Onboard</button>
            <button className="pb-4 hover:text-black whitespace-nowrap transition">Engage</button>
            <button className="pb-4 hover:text-black whitespace-nowrap transition">Retain</button>
          </div>

          {/* Tab Content */}
          <p className="max-w-3xl text-xl md:text-2xl text-gray-800 leading-relaxed font-medium mb-16">
            Gain 3.5x more data with expertly-designed forms. Then complete the picture with built-in AI data enrichment.
          </p>

          {/* Big FitCo Image Placeholder */}
          <div className="w-full max-w-4xl relative overflow-hidden rounded-[32px] bg-gray-100 aspect-video shadow-2xl flex items-center justify-center">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-[#2f2b2b] bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
            
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 right-6 h-16 rounded-full bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-between px-8 text-white">
              <div className="flex gap-6 text-sm font-medium">
                <span>About</span>
                <span className="opacity-70">Pricing</span>
              </div>
              <div className="text-2xl font-serif italic font-bold tracking-tight">FitCo</div>
              <div className="flex gap-6 text-sm font-medium items-center">
                <span className="opacity-70">Login</span>
                <span className="bg-white/10 px-4 py-1.5 rounded-full">Sign up</span>
              </div>
            </div>

            {/* Bottom Button Overlay */}
            <div className="absolute bottom-10">
              <button className="rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-10 py-5 text-2xl font-medium text-white transition hover:bg-white/30 shadow-lg">
                Get a free virtual class
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
