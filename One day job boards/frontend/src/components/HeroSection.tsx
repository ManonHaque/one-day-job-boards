import Link from "next/link";
import React from "react";
import { Spotlight } from "./ui/Spotlight";
//import { Button } from "./ui/moving-border";
import { Button } from "./ui/moving-border";

function HeroSection() {
  return (
    <div className="h-auto md:h-[40rem] w-full rounded-md flex flex-col items-center justify-center relative overflow-hidden mx-auto py-10 md:py-0">
      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />

      <div className="p-4 relative z-10 w-full text-center">
        <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
          Empowering CUET Students to Collaborate and Grow
        </h1>

        {/* Tagline */}
        <p className="text-neutral-400 text-sm md:text-base mt-3 tracking-wide uppercase">
          CUET’s One-Day Platform for Skills, Earnings & Collaboration
        </p>

        <p className="mt-6 font-normal text-base md:text-lg text-neutral-300 max-w-2xl mx-auto">
          The One-Day Job Board is CUET’s dedicated platform for
          cross-department collaboration, micro-earning opportunities, and
          real-time skill development. Students can showcase their talents, earn
          credits or cash, and build a strong professional network — all while
          studying.
        </p>
        <div className="mt-6">
          <Link href="/jobs">
            <Button borderRadius="1.75rem">Browse Jobs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
