"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  reward: number;
  reward_type: string;
  department: string;
  estimated_time?: string;
  skills_required?: string[];
  status: string;
  is_featured: boolean;
  created_at: string;
  posted_by: string;
}

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
}

interface BrowseJobsProps {
  showApplyButton?: boolean;
  initialFilters?: {
    department?: string;
    status?: string;
  };
}

const DEPARTMENTS = ["Design", "Development", "Writing", "Marketing", "Data Analysis", "Video Editing", "Other"];

export default function BrowseJobs({ showApplyButton = true, initialFilters = {} }: BrowseJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    department: initialFilters.department || "",
    reward_type: "",
    status: initialFilters.status || "open",
  });

  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
  }, [filters]);

  const fetchUserApplications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const applications = await api.getMyApplications() as Application[];
      const jobIds = new Set(applications.map((app) => app.job_id));
      setAppliedJobIds(jobIds);
    } catch (error) {
      // User not logged in or error fetching applications
      console.log('Could not fetch applications:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.department) params.department = filters.department;
      if (filters.status) params.status = filters.status;
      
      const jobsData = await api.getJobs(params) as Job[];
      
      // Filter by reward_type on frontend if needed
      let filteredJobs = jobsData;
      if (filters.reward_type) {
        filteredJobs = jobsData.filter((job: Job) => job.reward_type === filters.reward_type);
      }
      
      setJobs(filteredJobs);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch jobs";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to apply for jobs');
      return;
    }

    try {
      setApplying(jobId);
      await api.createApplication(jobId);
      toast.success("Application submitted successfully!");
      // Add to applied jobs set
      setAppliedJobIds(prev => new Set([...prev, jobId]));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to apply";
      toast.error(message);
    } finally {
      setApplying(null);
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

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Filter Jobs</h3>
          <button
            onClick={() => setFilters({ department: '', reward_type: '', status: '' })}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-400">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white transition"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-400">Reward Type</label>
            <select
              value={filters.reward_type}
              onChange={(e) => setFilters({ ...filters, reward_type: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white transition"
            >
              <option value="">All Types</option>
              <option value="cash">💵 Cash</option>
              <option value="credits">⭐ Credits</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-400">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white transition"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <h3 className="text-2xl font-semibold mb-2">No Jobs Found</h3>
          <p className="text-neutral-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition">{job.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(job.status)}`}>
                      {job.status.replace("_", " ").toUpperCase()}
                    </span>
                    {job.is_featured && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/30">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-neutral-400 mb-4 line-clamp-3">{job.description}</p>

              <div className="flex flex-wrap gap-4 text-sm mb-6">
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
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                    {job.skills_required.length > 3 && (
                      <span className="px-2 py-1 text-neutral-500 text-xs">+{job.skills_required.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Link href={`/jobs/${job.id}`} className="flex-1">
                  <button className="w-full px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-neutral-700">
                    View Details
                  </button>
                </Link>
                {showApplyButton && job.status === "open" && (
                  appliedJobIds.has(job.id) ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-3 bg-green-500/20 text-green-400 font-semibold rounded-lg border border-green-500/30 cursor-not-allowed"
                    >
                      ✓ Already Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className="flex-1 px-4 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
                    >
                      {applying === job.id ? "Applying..." : "Apply Now"}
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { BrowseJobs };
