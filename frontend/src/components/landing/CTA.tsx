import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl bg-gradient-to-b from-muted to-background rounded-2xl p-6 md:p-8 border shadow-sm text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/quiz" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow hover:opacity-90 transition">
            Play Now
          </Link>
          <Link href="/topup" className="px-6 py-3 rounded-full border border-primary text-primary font-semibold hover:bg-primary/10 transition">
            Top Up
          </Link>
          <Link href="/leaderboard" className="px-6 py-3 rounded-full border font-semibold hover:border-primary hover:text-primary transition">
            Leaderboard
          </Link>
        </div>
      </div>
    </section>
  );
}


