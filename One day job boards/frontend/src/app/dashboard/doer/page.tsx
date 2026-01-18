"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  submitted_work?: string;
  created_at: string;
  job?: {
    id: string;
    title: string;
    description: string;
    reward: number;
    reward_type: string;
    department: string;
    status: string;
  };
}

type TabType = "all" | "pending" | "accepted" | "rejected";

export default function DoerDashboard() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [earnings, setEarnings] = useState({ total_credits: 0, total_cash: 0, total_completed_jobs: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "doer") {
      router.push("/login");
      return;
    }

    fetchApplications();
    fetchEarnings();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [activeTab, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getMyApplications() as Application[];
      
      // Fetch job details for each application
      const applicationsWithJobs = await Promise.all(
        data.map(async (app: Application) => {
          try {
            const job = await api.getJob(app.job_id);
            return { ...app, job };
          } catch (error) {
            return app;
          }
        })
      );
      
      setApplications(applicationsWithJobs as Application[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const earningsData = await api.getMyEarnings() as { total_credits: number; total_cash: number; total_completed_jobs: number };
      setEarnings(earningsData);
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    }
  };

  const filterApplications = () => {
    if (activeTab === "all") {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter((app) => app.status === activeTab));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-400 border-neutral-500/30";
    }
  };

  const getTabCount = (status: TabType) => {
    if (status === "all") return applications.length;
    return applications.filter((app) => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Doer Dashboard</h1>
          <p className="text-neutral-400">Manage your job applications and tasks</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="text-neutral-400 text-sm mb-1">Total Applications</div>
            <div className="text-3xl font-bold">{applications.length}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-yellow-400 text-sm mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-400">{getTabCount("pending")}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="text-green-400 text-sm mb-1">Accepted</div>
            <div className="text-3xl font-bold text-green-400">{getTabCount("accepted")}</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="text-blue-400 text-sm mb-1">Total Credits Earned</div>
            <div className="text-3xl font-bold text-blue-400">⭐ {earnings.total_credits}</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="text-purple-400 text-sm mb-1">Total Cash Earned</div>
            <div className="text-3xl font-bold text-purple-400">💵 ${earnings.total_cash.toFixed(2)}</div>
          </div>
        </div>

        {/* Browse Jobs Button */}
        <div className="mb-8">
          <Link href="/jobs">
            <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition">
              🔍 Browse Available Jobs
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(["all", "pending", "accepted", "rejected"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-white text-black"
                  : "bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <h3 className="text-2xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-neutral-400 mb-6">
              {activeTab === "all"
                ? "Start by browsing available jobs and applying to ones that match your skills"
                : `No ${activeTab} applications`}
            </p>
            <Link href="/jobs">
              <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition">
                Browse Jobs
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="text-xl font-bold text-white flex-1">
                        {application.job?.title || "Job Title Unavailable"}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusBadge(application.status)}`}>
                          {application.status.toUpperCase()}
                        </span>
                        {application.job && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getJobStatusBadge(application.job.status)}`}>
                            {application.job.status.replace("_", " ").toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {application.job && (
                      <>
                        <p className="text-neutral-400 mb-4 line-clamp-2">{application.job.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">💰</span>
                            <span className="font-semibold">
                              {application.job.reward} {application.job.reward_type === "cash" ? "💵" : "⭐"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">📁</span>
                            <span>{application.job.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-500">📅</span>
                            <span>Applied: {new Date(application.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {application.submitted_work && (
                      <div className="mt-4 p-4 bg-neutral-800/50 rounded-lg">
                        <p className="text-sm text-neutral-400 mb-2">Submitted Work:</p>
                        <p className="text-neutral-200">{application.submitted_work}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-40">
                    {application.job && (
                      <Link href={`/jobs/${application.job.id}`}>
                        <button className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition text-sm">
                          View Job
                        </button>
                      </Link>
                    )}
                    {application.status === "accepted" && application.job?.status === "in_progress" && (
                      <button className="w-full px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 font-semibold rounded-lg hover:bg-green-500/30 transition text-sm">
                        Submit Work
                      </button>
                    )}  
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
