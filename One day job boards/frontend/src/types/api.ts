/**
 * TypeScript types for API responses
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'poster' | 'doer' | 'admin';
  department?: string;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  reward: number;
  reward_type: 'credits' | 'cash';
  posted_by: string;
  department?: string;
  estimated_time?: string;
  skills_required?: string[];
  status: 'open' | 'in_progress' | 'completed';
  is_featured?: boolean;
  image_url?: string;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  submitted_work?: string;
  created_at: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  problem: string;
  solution: string;
  time_to_deliver: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  tags?: string[];
  image_url?: string;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  job_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

