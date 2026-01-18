'use client';
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { cn } from "@/utils/cn"; // needed for class merging
import React from "react";

const reviews = [
  {
    name: "Arif Hasan",
    role: "3rd Year CSE Student",
    review:
      "Posted a quick poster design task and got it done beautifully within a few hours! The student was super responsive and creative.",
    rating: 5,
  },
  {
    name: "Mim Rahman",
    role: "2nd Year EEE Student",
    review:
      "Needed help automating an Excel sheet — the Python script worked perfectly. Saved me tons of time!",
    rating: 4.5,
  },
  {
    name: "Tanvir Alam",
    role: "1st Year Architecture Student",
    review:
      "Great experience hiring through the platform. The freelancer delivered a stunning event photo collection for our club fest.",
    rating: 5,
  },
  {
    name: "Sadia Karim",
    role: "4th Year Civil Engineering Student",
    review:
      "I designed a webpage for the Robotics Club and got excellent feedback. This platform really helps showcase student skills!",
    rating: 5,
  },
  {
    name: "Rakibul Islam",
    role: "2nd Year Mechanical Student",
    review:
      "Tried my first job here and earned in just one day! The task posting and approval process was very smooth.",
    rating: 4.8,
  },
];

function ReviewCard() {
  return (
    <div className="relative flex flex-col items-center justify-center h-[45rem] w-full overflow-hidden">
      {/* 🟩 Grid Background (from GridBackgroundDemo) */}
      <div
        className={cn(
          "absolute inset-0 z-0",
          "bg-white dark:bg-black",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      {/* subtle radial fade for depth */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      {/* 🌟 Foreground content */}
      <h2 className="relative z-10 text-3xl font-bold text-center mb-8 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text text-transparent">
        Hear our Harmony: Voices of Success
      </h2>
      <div className="relative z-10 flex justify-center w-full overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl">
          <InfiniteMovingCards items={reviews} direction="right" speed="slow" />
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
