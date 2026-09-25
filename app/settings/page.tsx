export default function SettingsPage() {
  const items = [
    'Theme',
    'Thank You Screen',
    'Integrations',
    'Logic Jumps',
  ];

  return (
    <main className="min-h-screen bg-[#f6f3ee] p-8 text-[#191919]">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-black tracking-[-0.06em]">Settings</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="rounded-[24px] border border-[#e7dfd5] bg-white p-6 shadow-sm">
              <div className="mb-2 text-xl font-semibold">{item}</div>
              <div className="text-[#726d68]">Coming Soon</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
