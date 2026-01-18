"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Job {
  id: string;
  title: string;
  description: string;
  reward: number;
  reward_type: string;
  department: string;
  status: string;
  posted_by: string;
  created_at: string;
}

export default function ManageJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs with status filter:', statusFilter);
      const data = await api.getAllJobs({
        status: statusFilter || undefined,
        limit: 100,
      });
      console.log('Jobs fetched:', data);
      if (!Array.isArray(data)) {
        console.error('Jobs data is not an array:', data);
        toast.error('Invalid response format');
        setJobs([]);
        return;
      }
      setJobs(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch jobs";
      console.error('Error fetching jobs:', error);
      toast.error(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete job "${title}"?`)) return;

    try {
      setDeletingId(jobId);
      await api.deleteJobAdmin(jobId);
      toast.success("Job deleted successfully");
      setJobs(jobs.filter((j) => j.id !== jobId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete job";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const getRewardBadge = (rewardType: string) => {
    return rewardType === "cash" ? "💵 Cash" : "⭐ Credits";
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
        {/* Back Button */}
        <Link href="/dashboard/admin">
          <button className="mb-6 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition">
            ← Back to Admin Panel
          </button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Manage Job Posts</h1>
          <p className="text-neutral-400">
            View and remove job posts. Total jobs: {jobs.length}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6 flex gap-4 items-center">
          <label className="text-sm font-semibold">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white transition"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
            <p className="text-neutral-400 text-lg">No jobs found</p>
            <p className="text-neutral-500 text-sm mt-2">Try changing the filter or check the browser console for errors</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden hover:border-neutral-700 transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                            job.status
                          )}`}
                        >
                          {job.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs font-semibold border border-neutral-700">
                          {job.department}
                        </span>
                        <span className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs font-semibold border border-neutral-700">
                          {getRewardBadge(job.reward_type)}: {job.reward}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === job.id ? null : job.id)
                      }
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-sm font-semibold transition"
                    >
                      {expandedId === job.id ? "Hide" : "View"} Details
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === job.id && (
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                      <div>
                        <p className="text-sm text-neutral-500 mb-1">Description</p>
                        <p className="text-neutral-300 whitespace-pre-wrap">
                          {job.description.substring(0, 200)}
                          {job.description.length > 200 ? "..." : ""}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-neutral-500">Posted By</p>
                          <p className="text-neutral-300 font-semibold">{job.posted_by}</p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Created</p>
                          <p className="text-neutral-300 font-semibold">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-end gap-2">
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      disabled={deletingId === job.id}
                      className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-semibold hover:bg-red-500/30 transition disabled:opacity-50"
                    >
                      {deletingId === job.id ? "..." : "Delete Job"}
                    </button>
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
