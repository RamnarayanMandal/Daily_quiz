export default function Footer() {
  return (
    <footer className="border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-muted-foreground flex items-center justify-between">
        <p>© {new Date().getFullYear()} Daily Quiz & Rewards</p>
        <div className="flex items-center gap-4">
          <a href="/leaderboard" className="hover:text-primary">Leaderboard</a>
          <a href="/topup" className="hover:text-primary">Top Up</a>
          <a href="/quiz" className="hover:text-primary">Play</a>
        </div>
      </div>
    </footer>
  );
}


