"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const createJobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255, "Title must be less than 255 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must be less than 5000 characters"),
  reward: z.number().min(1, "Reward must be greater than 0"),
  reward_type: z.enum(["cash", "credits"]),
  department: z.string().min(1, "Department is required"),
  estimated_time: z.string().optional(),
  skills_required: z.string().optional(),
  is_featured: z.boolean().optional(),
});

type CreateJobFormData = z.infer<typeof createJobSchema>;

const DEPARTMENTS = ["Design", "Development", "Writing", "Marketing", "Data Analysis", "Video Editing", "Other"];

interface CreateJobFormProps {
  onSuccess?: () => void;
}

export default function CreateJobForm({ onSuccess }: CreateJobFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      reward_type: "cash",
      is_featured: false,
    },
  });

  const onSubmit = async (data: CreateJobFormData) => {
    setLoading(true);

    try {
      const jobData = {
        title: data.title,
        description: data.description,
        reward: data.reward,
        reward_type: data.reward_type,
        department: data.department,
        estimated_time: data.estimated_time || null,
        skills_required: data.skills_required ? data.skills_required.split(",").map((s) => s.trim()) : [],
        is_featured: data.is_featured || false,
      };

      await api.createJob(jobData);
      toast.success("Job created successfully!");
      reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create job";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-2">Create a New Job Post</h2>
        <p className="text-neutral-400 mb-8">Fill in the details below to create your job posting</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Job Title *</label>
            <input
              {...register("title")}
              placeholder="e.g., Website Redesign"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              disabled={loading}
            />
            {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Description *</label>
            <textarea
              {...register("description")}
              placeholder="Describe the job in detail..."
              rows={6}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition resize-none"
              disabled={loading}
            />
            {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>}
          </div>

          {/* Reward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Reward Amount *</label>
              <input
                {...register("reward", { valueAsNumber: true })}
                type="number"
                placeholder="e.g., 50"
                step="0.01"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                disabled={loading}
              />
              {errors.reward && <p className="mt-1 text-sm text-red-400">{errors.reward.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Reward Type *</label>
              <select
                {...register("reward_type")}
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
                disabled={loading}
              >
                <option value="cash">Cash 💵</option>
                <option value="credits">Credits ⭐</option>
              </select>
              {errors.reward_type && <p className="mt-1 text-sm text-red-400">{errors.reward_type.message}</p>}
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Department *</label>
            <select
              {...register("department")}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              disabled={loading}
            >
              <option value="">Select a department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && <p className="mt-1 text-sm text-red-400">{errors.department.message}</p>}
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Estimated Time to Complete</label>
            <input
              {...register("estimated_time")}
              placeholder="e.g., 2 hours, 1 day, 1 week"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              disabled={loading}
            />
            {errors.estimated_time && <p className="mt-1 text-sm text-red-400">{errors.estimated_time.message}</p>}
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Skills Required (comma-separated)</label>
            <input
              {...register("skills_required")}
              placeholder="e.g., React, TypeScript, Tailwind CSS"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition"
              disabled={loading}
            />
            {errors.skills_required && <p className="mt-1 text-sm text-red-400">{errors.skills_required.message}</p>}
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              {...register("is_featured")}
              type="checkbox"
              id="featured"
              className="w-4 h-4 bg-neutral-800 border border-neutral-700 rounded"
              disabled={loading}
            />
            <label htmlFor="featured" className="text-sm font-medium text-white cursor-pointer">
              ⭐ Make this job featured (visible on homepage)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-100 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner /> Creating...
                </>
              ) : (
                <>
                  ✨ Create Job Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { CreateJobForm };
