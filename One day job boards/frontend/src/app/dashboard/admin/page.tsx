"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [users, jobs] = await Promise.all([
        api.getAllUsers({ limit: 1000 }) as Promise<any[]>,
        api.getAllJobs({ limit: 1000 }) as Promise<any[]>,
      ]);
      
      setStats({
        totalUsers: users.length || 0,
        activeJobs: jobs.filter((job: any) => job.status === "open").length || 0,
        totalApplications: jobs.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/[0.96] bg-grid-white/[0.02] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-12 text-center">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard/admin/users">
            <div className="p-8 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 hover:border-neutral-500 cursor-pointer transition transform hover:scale-105">
              <div className="text-4xl mb-3">👥</div>
              <h2 className="text-2xl font-semibold mb-2">Manage Users</h2>
              <p className="text-neutral-400">
                View, edit or remove student accounts.
              </p>
              <div className="mt-4 text-sm text-neutral-500">Click to manage →</div>
            </div>
          </Link>

          <Link href="/dashboard/admin/jobs">
            <div className="p-8 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 hover:border-neutral-500 cursor-pointer transition transform hover:scale-105">
              <div className="text-4xl mb-3">📋</div>
              <h2 className="text-2xl font-semibold mb-2">Manage Job Posts</h2>
              <p className="text-neutral-400">
                Approve, reject or remove job posts.
              </p>
              <div className="mt-4 text-sm text-neutral-500">Click to manage →</div>
            </div>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
          <h3 className="text-lg font-semibold mb-3">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-400">
            <div>
              <p className="text-neutral-500">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">
                {loading ? "..." : stats.totalUsers}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Active Jobs</p>
              <p className="text-2xl font-bold text-white mt-1">
                {loading ? "..." : stats.activeJobs}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Total Jobs</p>
              <p className="text-2xl font-bold text-white mt-1">
                {loading ? "..." : stats.totalApplications}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
