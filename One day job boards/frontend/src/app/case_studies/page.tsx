"use client";

import Image from "next/image";
import React, { useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import caseData from "@/data/case_studies.json";
import CaseStudiesFilter from "@/components/CaseStudiesFilter";
import Link from "next/link"; // Add at the top of the file


function Page() {
  // STEP 1 — Make state for filtered data
  const [filtered, setFiltered] = useState(caseData.caseStudies);

  return (
    <div className="min-h-screen bg-black py-12 pt-36">

      {/* STEP 2 — Add Filter Component ABOVE the grid */}
      <CaseStudiesFilter
        data={caseData.caseStudies}
        onFilter={setFiltered}
      />

      <h1 className="text-lg md:text-7xl text-center font-sans font-bold mb-8 text-white">
        Case Studies ({filtered.length})
      </h1>

      <div className="flex flex-wrap justify-center">
        {/* STEP 3 — Render FILTERED results instead of all data */}
        {filtered.map((study) => (
          <CardContainer className="inter-var m-4" key={study.id}>
            <CardBody
              className="bg-gray-50 relative group/card 
              dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] 
              dark:bg-black dark:border-white/[0.2]
              border-black/[0.1] w-auto sm:w-[30rem] h-auto 
              rounded-xl p-6 border"
            >
              {/* Title */}
              <CardItem
                translateZ="50"
                className="text-xl font-bold text-neutral-600 dark:text-white"
              >
                {study.title}
              </CardItem>

              {/* Problem */}
              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-3 dark:text-neutral-300"
              >
                <span className="font-semibold text-neutral-700 dark:text-white">
                  Problem:{" "}
                </span>
                {study.problem}
              </CardItem>

              {/* Solution */}
              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              >
                <span className="font-semibold text-neutral-700 dark:text-white">
                  Solution:{" "}
                </span>
                {study.solution}
              </CardItem>

              {/* Image */}
              <CardItem translateZ="100" className="w-full mt-4">
                <Image
                  src={study.image}
                  height="1000"
                  width="1000"
                  className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                  alt={study.title}
                />
              </CardItem>

              {/* Bottom Section */}
              <div className="flex justify-between items-center mt-8">
                <Link href={`/case_studies/${study.id}`}>
  <CardItem translateZ={20} as="button" className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white">
    View details →
  </CardItem>
</Link>

                <CardItem
                  translateZ={20}
                  as="button"
                  className="px-4 py-2 rounded-xl bg-black dark:bg-white 
                    dark:text-black text-white text-xs font-bold"
                >
                  Post similar task
                </CardItem>
              </div>

              {/* Time */}
              <p className="text-right text-xs text-neutral-400 mt-2">
                ⏳ {study.timeToDeliver} min
              </p>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </div>
  );
}

export default Page;
