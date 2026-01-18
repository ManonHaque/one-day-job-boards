"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useState } from "react";

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  role: z.enum(["poster", "doer"], {
    required_error: "Please select a role",
  }),
  department: z.string().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);

    try {
      await api.signup({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        department: data.department || undefined,
      });

      toast.success("Signup successful! Please login.");
      // Dispatch event in case user auto-logs in (future feature)
      window.dispatchEvent(new Event("auth-changed"));
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-8 w-80 flex flex-col space-y-4 border border-neutral-700"
      >
        <h1 className="text-2xl font-bold text-center text-black dark:text-white">
          Create Account
        </h1>

        <div>
          <input
            {...register("username")}
            placeholder="Username"
            className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <select
            {...register("role")}
            className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select Role</option>
            <option value="poster">Job Poster</option>
            <option value="doer">Job Doer</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("department")}
            placeholder="Department (optional)"
            className="w-full p-2 border rounded-md dark:bg-neutral-800 dark:border-neutral-700 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-md py-2 font-medium transition"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-green-600 dark:text-green-500 hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}
