"use client";

import { useEffect, useState } from "react";
import BrowseJobs from "@/components/BrowseJobs";

export default function JobsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-white">Browse </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 inline-block">Available Jobs</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        <BrowseJobs showApplyButton={userRole === "doer"} initialFilters={{ status: "open" }} />
      </div>
    </div>
  );
}
