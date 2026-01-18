"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface User {
  id: string; // UUID
  username: string;
  email: string;
  role: "poster" | "doer" | "admin";
  department?: string;
  created_at: string;
}

export default function ManageUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({});
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users with role filter:', roleFilter);
      const data = await api.getAllUsers({
        role: roleFilter || undefined,
        limit: 100,
      });
      console.log('Users fetched:', data);
      if (!Array.isArray(data)) {
        console.error('Users data is not an array:', data);
        toast.error('Invalid response format');
        setUsers([]);
        return;
      }
      setUsers(data);
      // Initialize selected roles
      const initialRoles: { [key: string]: string } = {};
      data.forEach((user: User) => {
        initialRoles[user.id] = user.role;
      });
      setSelectedRole(initialRoles);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch users";
      console.error('Error fetching users:', error);
      toast.error(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      setDeletingId(userId);
      await api.deleteUser(userId);
      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u.id !== userId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateRole = async (username: string, userId: string) => {
    const newRole = selectedRole[userId];
    if (newRole === users.find((u) => u.id === userId)?.role) {
      toast("No changes made");
      return;
    }

    try {
      setUpdatingRole(userId);
      await api.updateUserRole(username, newRole);
      toast.success("User role updated successfully");
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole as "poster" | "doer" | "admin" } : u))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update role";
      toast.error(message);
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "poster":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "doer":
        return "bg-green-500/20 text-green-400 border-green-500/30";
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
          <h1 className="text-4xl font-bold mb-4">Manage Users</h1>
          <p className="text-neutral-400">
            View, edit roles, or remove user accounts. Total users: {users.length}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6 flex gap-4 items-center">
          <label className="text-sm font-semibold">Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white transition"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="poster">Poster</option>
            <option value="doer">Doer</option>
          </select>
        </div>

        {/* Users Table */}
        {users.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
            <p className="text-neutral-400 text-lg">No users found</p>
            <p className="text-neutral-500 text-sm mt-2">Try changing the filter or check the browser console for errors</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-800 border-b border-neutral-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Username</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Current Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Change Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-neutral-800/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{user.username}</p>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <select
                            value={selectedRole[user.id] || user.role}
                            onChange={(e) =>
                              setSelectedRole({
                                ...selectedRole,
                                [user.id]: e.target.value,
                              })
                            }
                            className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm focus:outline-none focus:border-white transition"
                          >
                            <option value="doer">Doer</option>
                            <option value="poster">Poster</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.username, user.id)}
                            disabled={updatingRole === user.id}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm font-semibold hover:bg-blue-500/30 transition disabled:opacity-50"
                          >
                            {updatingRole === user.id ? "..." : "Update"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-400">
                        {user.department || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={deletingId === user.id}
                          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded font-semibold hover:bg-red-500/30 transition disabled:opacity-50"
                        >
                          {deletingId === user.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
