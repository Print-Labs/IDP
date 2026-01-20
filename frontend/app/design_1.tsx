import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-6 items-center text-center max-w-4xl z-10">

        {/* Hero Badge */}
        <div className="glass-panel px-4 py-1.5 rounded-full text-sm font-medium text-white/80 animate-in fade-in slide-in-from-bottom-4 duration-700">
          LayerZero v1.0 • Systems Nominal
        </div>

        {/* Hero Title */}
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 animate-in fade-in zoom-in-95 duration-1000 delay-100">
          ENABLE GREAT<br />THINGS.
        </h1>

        {/* Hero Description */}
        <p className="text-xl text-white/60 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          The autonomous 3D printing infrastructure for our campus.
          Upload, Slice, Print, and Repeat.
          Repaying the <span className="text-white/90 font-bold">₹1.54L</span> goal, one layer at a time.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Button asChild size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 text-base font-semibold transition-all hover:scale-105 active:scale-95">
            <Link href="/dashboard">
              Launch Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full glass-card hover:bg-white/10 text-white border-white/20 hover:border-white/40 text-base font-medium transition-all">
            <Link href="/login">
              Aperture Access
            </Link>
          </Button>
        </div>
      </main>

      {/* Decorative Blur Backgrounds */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[100px] -z-10 animate-pulse duration-10000" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px] -z-10 animate-pulse duration-7000 delay-1000" />
    </div>
  );
}
