"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";

const jobContent = [
  {
    title: "Poster Design for CUET Club Event",
    description:
      "A clean, vibrant poster designed within 24 hours for CUET Cultural Club. Modern layout, bold typography & export-ready graphics.",
    content: (
      <img
        src="https://images.unsplash.com/photo-1580130732478-4e339fb6836f?q=80&w=1498&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        className="h-full w-full object-cover rounded-lg shadow-xl"
        alt="Event Photography"
      />
    ),
  },
  {
    title: "Python Script for Attendance Automation",
    description:
      "A script built using Python + Pandas that generates automated attendance sheets for department events.",
    content: (
      <img
        src="/works/python-script.png" // 👉 Your local file
        className="h-full w-full object-cover rounded-lg shadow-xl"
        alt="Python Script"
      />
    ),
  },
  {
    title: "Photography & Editing – CUET Tech Carnival",
    description:
      "Professional-quality event shots captured, retouched & delivered within 48 hours using Lightroom.",
    content: (
      <img
        src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"
        className="h-full w-full object-cover rounded-lg shadow-xl"
        alt="Event Photography"
      />
    ),
  },
  {
    title: "Robotics Club Recruitment Webpage",
    description:
      "A clean React + Tailwind webpage built to handle 500+ recruitment applications seamlessly.",
    content: (
      <img
        src="/works/Robotics-Club.png" // 👉 Your local file
        className="h-full w-full object-cover rounded-lg shadow-xl"
        alt="Robotics Club"
      />
    ),
  },
  {
    title: "Resume & CV Enhancement Service",
    description:
      "A completely redesigned resume with modern layout, strong typography & ATS-friendly formatting.",
    content: (
      <img
        src="/works/resume.png" // 👉 Your local file
        className="h-full w-full object-cover rounded-lg shadow-xl"
        alt="Resume"
      />
    ),
  },

  {},
];

function SomeWorks() {
  return (
    <div id="some-works" className="py-20 bg-black/[0.96] bg-grid-white/[0.02]">
      <h3 className="p-12 text-4xl md:text-6xl font-bold text-center text-white ">
        See What Students Have Built
      </h3>
      <p className="text-center text-neutral-300 max-w-2xl mx-auto mb-5">
        Real micro-jobs completed by CUET students — showcasing talent,
        creativity, and skill.
      </p>

      <div className="backdrop-blur-md bg-white/10 ">
        <StickyScroll content={jobContent} />
      </div>
    </div>
  );
}


export default SomeWorks;
