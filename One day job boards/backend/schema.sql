-- PostgreSQL Schema for One-Day Job Board
-- Run this in pgAdmin4 to create the database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('poster', 'doer', 'admin')) NOT NULL,
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    reward DECIMAL(10, 2) NOT NULL,
    reward_type VARCHAR(20) CHECK (reward_type IN ('credits', 'cash')) NOT NULL,
    posted_by UUID REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(50),
    estimated_time VARCHAR(50),
    skills_required JSONB,
    status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'completed')) DEFAULT 'open',
    is_featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case Studies Table
CREATE TABLE case_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    problem TEXT NOT NULL,
    solution TEXT NOT NULL,
    time_to_deliver INTEGER NOT NULL,  -- in minutes
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')) NOT NULL,
    tags JSONB,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    submitted_work TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_department ON jobs(department);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_job_id ON reviews(job_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);