"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
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
  submitted_work?: string;
  created_at: string;
  applicant?: {
    id: string;
    username: string;
    email: string;
    department?: string;
  };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingJobStatus, setUpdatingJobStatus] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token) {
      // Allow viewing job details without login, but redirect for actions
      setUserRole(null);
    } else {
      setUserRole(role);
    }

    fetchJobAndApplications();
    if (token && role === "doer") {
      checkIfApplied();
    }
  }, [id]);

  const checkIfApplied = async () => {
    try {
      const myApplications = await api.getMyApplications() as Application[];
      const applied = myApplications.some((app) => app.job_id === id);
      setHasApplied(applied);
    } catch (error) {
      console.log("Could not check application status");
    }
  };

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      const jobData = await api.getJob(id);
      setJob(jobData as Job);
      
      // Only fetch applications if user is poster/admin
      const role = localStorage.getItem("role");
      if (role === "poster" || role === "admin") {
        try {
          const applicationsData = await api.getApplicationsForJob(id);
          setApplications(applicationsData as Application[]);
        } catch (error) {
          // User might not be the job poster, ignore error
          console.log("Could not fetch applications");
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch data";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!userRole) {
      toast.error("Please login to apply for this job");
      router.push("/login");
      return;
    }

    try {
      setApplying(true);
      await api.createApplication(id);
      toast.success("Application submitted successfully!");
      setHasApplied(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to apply";
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(applicationId);
      await api.updateApplicationStatus(applicationId, newStatus);
      toast.success(`Application ${newStatus}!`);
      fetchJobAndApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update application";
      toast.error(message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateJobStatus = async (newStatus: string) => {
    try {
      setUpdatingJobStatus(true);
      await api.updateJobStatus(id, newStatus);
      toast.success(`Job status updated to ${newStatus}!`);
      fetchJobAndApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update job status";
      toast.error(message);
    } finally {
      setUpdatingJobStatus(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Link href="/dashboard/poster">
            <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link href={userRole === "doer" ? "/jobs" : "/dashboard/poster"}>
          <button className="mb-6 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition">
            ← Back to {userRole === "doer" ? "Browse Jobs" : "Dashboard"}
          </button>
        </Link>

        {/* Job Details Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getJobStatusBadge(job.status)}`}>
                  {job.status.replace("_", " ").toUpperCase()}
                </span>
                {job.is_featured && (
                  <span className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold border border-yellow-500/30">
                    ⭐ Featured
                  </span>
                )}
              </div>
            </div>

            {/* Job Status Update - Only for Posters/Admins */}
            {(userRole === "poster" || userRole === "admin") && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-neutral-400 font-semibold">Update Status:</label>
                <select
                  value={job.status}
                  onChange={(e) => handleUpdateJobStatus(e.target.value)}
                  disabled={updatingJobStatus}
                  className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white font-semibold focus:outline-none focus:border-white transition"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-neutral-800/50 rounded-xl p-4">
              <div className="text-neutral-400 text-sm mb-1">Reward</div>
              <div className="text-2xl font-bold">
                {job.reward} {job.reward_type === "cash" ? "💵" : "⭐"}
              </div>
            </div>
            <div className="bg-neutral-800/50 rounded-xl p-4">
              <div className="text-neutral-400 text-sm mb-1">Department</div>
              <div className="text-xl font-semibold">{job.department}</div>
            </div>
            {job.estimated_time && (
              <div className="bg-neutral-800/50 rounded-xl p-4">
                <div className="text-neutral-400 text-sm mb-1">Estimated Time</div>
                <div className="text-xl font-semibold">{job.estimated_time}</div>
              </div>
            )}
          </div>

          {job.skills_required && job.skills_required.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Button for Doers */}
          {userRole === "doer" && (
            <div className="mt-6 pt-6 border-t border-neutral-800">
              {hasApplied ? (
                <button
                  disabled
                  className="w-full py-4 bg-green-500/20 text-green-400 border border-green-500/30 font-bold rounded-lg"
                >
                  ✓ Already Applied
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying || job.status !== "open"}
                  className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? "Submitting..." : job.status !== "open" ? "Job No Longer Available" : "Apply Now"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Applications Section - Only for Posters/Admins */}
        {(userRole === "poster" || userRole === "admin") && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Applications</h2>
              <span className="px-4 py-2 bg-neutral-800 rounded-lg font-semibold">
                Total: {applications.length}
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-400 text-lg">No applications yet</p>
                <p className="text-neutral-500 text-sm mt-2">Applications will appear here once doers apply</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-6 hover:bg-neutral-800 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold">{application.applicant?.username || "Unknown User"}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(application.status)}`}>
                            {application.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-neutral-400 space-y-1">
                          <p>📧 {application.applicant?.email || "N/A"}</p>
                          {application.applicant?.department && <p>📁 {application.applicant.department}</p>}
                          <p>📅 Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                        </div>
                        {application.submitted_work && (
                          <div className="mt-4 p-4 bg-neutral-900 rounded-lg">
                            <p className="text-sm text-neutral-400 mb-2">Submitted Work:</p>
                            <p className="text-neutral-200">{application.submitted_work}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {application.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateApplicationStatus(application.id, "accepted")}
                            disabled={updatingStatus === application.id}
                            className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 font-semibold rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                          >
                            {updatingStatus === application.id ? "..." : "Accept"}
                          </button>
                          <button
                            onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                            disabled={updatingStatus === application.id}
                            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                          >
                            {updatingStatus === application.id ? "..." : "Reject"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
