import React from 'react'
import { AnimatedTooltip } from './ui/animated-tooltip'
import { WavyBackground } from './ui/wavy-background'

const serviceProviders = [
  {
    id: 1,
    name: "Aisha Rahman",
    designation: "Graphic Designer (Posters, Banners, UI)",
    image:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&q=60",
  },
  {
    id: 2,
    name: "Tanvir Ahmed",
    designation: "Programming Helper (C/C++, Python, JavaScript)",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=60",
  },
  {
    id: 3,
    name: "Sadia Noor",
    designation: "Presentation & Report Expert",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=60",
  },
  {
    id: 4,
    name: "Mehedi Hasan",
    designation: "Electronics & Robotics Assistance",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=60",
  },
  {
    id: 5,
    name: "Raiyan Chowdhury",
    designation: "CV/Resume Editing + Career Guidance",
    image:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=800&q=80",
  },
  {
    id: 6,
    name: "Maliha Sultana",
    designation: "Tutoring (Math, Physics, CSE Course Help)",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
  },
];


function ServiceProvider() {
  return (
    <div className="relative h-[40rem] overflow-hidden flex items-center justify-center">
        <WavyBackground className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl md:text-4xl lg:text-7xl text-white font-bold text-center mb-8">Meet Our Top Service Providers
</h2>
            <p className="text-base md:text-lg text-white text-center mb-4">CUET students offering skills to help you complete your micro-jobs
</p>
            <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={serviceProviders} />
            </div>
        </WavyBackground>
    </div>
  )
}

export default ServiceProvider
