"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import CreateJobForm from "@/components/dashboard/CreateJobForm";
import PostedJobsList from "@/components/dashboard/PostedJobsList";

type TabType = "create" | "view";

export default function PosterDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("view");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "poster") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black/[0.96] bg-grid-white/[0.02] text-white pt-24">
      {/* Header */}
      <div className="relative px-6 py-8 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Poster Dashboard
          </h1>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-800 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab("view")}
            className={`py-4 px-4 font-semibold transition-all border-b-2 ${
              activeTab === "view"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">📋</span> Your Posted Jobs
            </span>
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`py-4 px-4 font-semibold transition-all border-b-2 ${
              activeTab === "create"
                ? "border-white text-white"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">➕</span> Create Job Post
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-12 py-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === "view" && <PostedJobsList />}
          {activeTab === "create" && <CreateJobForm onSuccess={() => setActiveTab("view")} />}
        </div>
      </div>
    </div>
  );
}
