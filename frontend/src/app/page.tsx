import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";

export default function Home() {
  return (
    <div className="space-y-2">
      <header className="w-full sticky top-0 bg-background/80 backdrop-blur border-b">
          <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-lg font-bold text-primary">Quiz Rewards</Link>
            <div className="flex items-center gap-6 text-sm"> 
              <Link href="/auth" className="hover:text-primary text-4xl font-bold text-[#65209E]"><CiLogin /></Link>
            </div>
          </nav>
        </header>
      <Hero />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
