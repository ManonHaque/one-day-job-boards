"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  reward: number;
  reward_type: string;
  department: string;
  estimated_time: string;
  status: string;
  is_featured: boolean;
  created_at: string;
  posted_by?: string;
}

export default function PostedJobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Get all jobs posted by current user
        const response: Job[] = await api.getMyJobs();
        setJobs(response);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch jobs";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      setDeleting(jobId);
      await api.deleteJob(jobId);
      toast.success("Job deleted successfully!");
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete job";
      toast.error(message);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeStyles: { [key: string]: string } = {
      open: "bg-green-500/20 text-green-400 border border-green-500/30",
      in_progress: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      completed: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
    };
    return badgeStyles[status] || "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-2xl font-semibold mb-2">No Jobs Posted Yet</h3>
        <p className="text-neutral-400 mb-6">Start by creating your first job post to get applications from qualified doers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Your Job Posts</h2>
          <p className="text-neutral-400">Manage and track your posted jobs</p>
        </div>
        <div className="px-4 py-2 bg-neutral-800 rounded-lg text-sm font-medium">
          Total: {jobs.length}
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              {/* Job Info */}
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <h3 className="text-xl font-bold text-white flex-1">{job.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusBadge(job.status)}`}>
                    {job.status.replace("_", " ").toUpperCase()}
                  </span>
                  {job.is_featured && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30">⭐ Featured</span>}
                </div>

                <p className="text-neutral-400 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">💰</span>
                    <span className="font-semibold">
                      {job.reward} {job.reward_type === "cash" ? "💵" : "⭐"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">📁</span>
                    <span>{job.department}</span>
                  </div>
                  {job.estimated_time && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">⏱️</span>
                      <span>{job.estimated_time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">📅</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 md:w-32">
                <Link href={`/jobs/${job.id}`}>
                  <button className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 transition text-sm">
                    View Details
                  </button>
                </Link>
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  disabled={deleting === job.id}
                  className="w-full px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg hover:bg-red-500/30 transition text-sm disabled:opacity-50"
                >
                  {deleting === job.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { PostedJobsList };
