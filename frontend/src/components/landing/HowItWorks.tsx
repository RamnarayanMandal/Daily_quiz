export default function HowItWorks() {
  return (
    <section className="py-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-2xl font-extrabold text-primary mb-2">1 SZL / day</div>
          <h3 className="text-lg font-semibold mb-1">Affordable fun</h3>
          <p className="text-sm text-muted-foreground">Get 10 questions daily for 1 SZL.</p>
        </div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-2xl font-extrabold text-secondary mb-2">Free streaks</div>
          <h3 className="text-lg font-semibold mb-1">Earn your way</h3>
          <p className="text-sm text-muted-foreground">Score 10/10 to get the next set free.</p>
        </div>
        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="text-2xl font-extrabold text-primary mb-2">Top-up via SMS/WEB</div>
          <h3 className="text-lg font-semibold mb-1">Flexible top-up</h3>
          <p className="text-sm text-muted-foreground">Send MORE or use Top Up to get more sets.</p>
        </div>
      </div>
    </section>
  );
}


