"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    
    try {
      const tokenData = await api.login(data.username, data.password);
      localStorage.setItem("token", tokenData.access_token);
      
      // Fetch user info to get role
      const userData = await api.getCurrentUser();
      localStorage.setItem("role", userData.role);
      
      // Dispatch custom event immediately to notify navbar
      window.dispatchEvent(new Event("auth-changed"));
      
      toast.success("Login successful!");
      
      // Small delay before navigation to ensure navbar updates first
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Navigate based on role
      if (userData.role === "poster") {
        router.push("/dashboard/poster");
      } else if (userData.role === "doer") {
        router.push("/dashboard/doer");
      } else {
        router.push("/dashboard/admin");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/[0.96] bg-grid-white/[0.02]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-neutral-900 shadow-lg rounded-2xl p-8 w-80 flex flex-col space-y-4 border border-neutral-700"
      >
        <h1 className="text-2xl font-bold text-center text-white">Login</h1>

        <div>
          <input
            {...register("username")}
            placeholder="Username"
            className="w-full p-2 rounded-md bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
          )}
        </div>

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-2 rounded-md bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-md py-2 font-medium transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-neutral-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-green-500 hover:text-green-400 hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
}
