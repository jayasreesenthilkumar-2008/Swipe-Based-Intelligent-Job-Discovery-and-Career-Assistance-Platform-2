/*
# Seed Demo Jobs + Storage Bucket

## Overview
Seeds 12 demo job postings so the swipe interface has content immediately.
Also creates a storage bucket for resume uploads.

## Changes
1. Drops FK on jobs.recruiter_id so demo jobs can exist without a real recruiter account
2. Inserts 12 demo jobs across various companies and roles
3. Creates a private `resumes` storage bucket with RLS policies
*/

-- Drop FK so we can seed demo jobs without a real auth user
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_recruiter_id_fkey;

-- Insert demo jobs
INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'Senior Frontend Engineer', 'Stripe', 'mnc',
   'Build delightful payment experiences used by millions. We use React, TypeScript, and a design system that sets the industry bar. You will own complex features end-to-end.',
   'full_time', 'remote', 'San Francisco, CA', 180000, 240000, 'USD', 'senior',
   ARRAY['React', 'TypeScript', 'CSS', 'GraphQL', 'Node.js'],
   now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Product Designer', 'Figma', 'startup',
   'Shape the future of collaborative design tools. You will drive product design from research through high-fidelity prototypes, working closely with engineering.',
   'full_time', 'hybrid', 'San Francisco, CA', 140000, 190000, 'USD', 'mid',
   ARRAY['Figma', 'Prototyping', 'Design Systems', 'User Research', 'CSS'],
   now() - interval '5 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Full Stack Engineer', 'Linear', 'startup',
   'Join a small, senior team building the issue tracking tool that developers love. React, Node.js, Postgres, and a relentless focus on speed.',
   'full_time', 'remote', 'Remote', 150000, 210000, 'USD', 'mid',
   ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL'],
   now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
   'Machine Learning Engineer', 'OpenAI', 'mnc',
   'Train and deploy large language models at scale. Strong background in PyTorch, distributed systems, and ML infrastructure required.',
   'full_time', 'hybrid', 'San Francisco, CA', 250000, 350000, 'USD', 'senior',
   ARRAY['Python', 'PyTorch', 'Distributed Systems', 'ML', 'Kubernetes'],
   now() - interval '3 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
   'DevOps Engineer', 'Vercel', 'startup',
   'Build and maintain the infrastructure powering millions of deployments. Experience with AWS, Kubernetes, Terraform, and CI/CD pipelines.',
   'full_time', 'remote', 'Remote', 160000, 220000, 'USD', 'mid',
   ARRAY['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD'],
   now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
   'Software Engineering Intern', 'Notion', 'startup',
   'Spend your summer building features for one of the fastest-growing productivity tools. Great for students passionate about React and product thinking.',
   'internship', 'remote', 'Remote', 8000, 12000, 'USD', 'entry',
   ARRAY['React', 'TypeScript', 'JavaScript', 'CSS'],
   now() - interval '8 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
   'Backend Engineer', 'Supabase', 'new_startup',
   'Help us build the open source Firebase alternative. Go, Postgres, realtime APIs, and edge functions at scale.',
   'full_time', 'remote', 'Remote', 130000, 180000, 'USD', 'mid',
   ARRAY['Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'API Design'],
   now() - interval '12 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
   'Mobile Engineer (React Native)', 'Discord', 'mnc',
   'Build the mobile experience for 150M+ users. React Native, native modules, and a passion for smooth 60fps interactions.',
   'full_time', 'hybrid', 'San Francisco, CA', 170000, 230000, 'USD', 'senior',
   ARRAY['React Native', 'TypeScript', 'iOS', 'Android', 'GraphQL'],
   now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
   'Data Scientist', 'Airbnb', 'mnc',
   'Analyze travel trends and build models that power search ranking and pricing. Python, SQL, and a love for clean data.',
   'full_time', 'remote', 'Remote', 160000, 210000, 'USD', 'mid',
   ARRAY['Python', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
   now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
   'Engineering Manager', 'Plaid', 'startup',
   'Lead a team of 6-8 engineers building financial infrastructure. People leadership, technical vision, and a track record of shipping.',
   'full_time', 'hybrid', 'San Francisco, CA', 220000, 290000, 'USD', 'lead',
   ARRAY['Leadership', 'Architecture', 'Python', 'Go', 'System Design'],
   now() - interval '4 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001',
   'Junior Frontend Developer', 'Cal.com', 'new_startup',
   'Perfect first role for a bootcamp grad or self-taught dev. We value eagerness to learn over years of experience. React + TypeScript.',
   'full_time', 'remote', 'Remote', 70000, 95000, 'USD', 'entry',
   ARRAY['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
   now() - interval '18 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, recruiter_id, title, company, company_type, description, job_type, work_mode, location, salary_min, salary_max, currency, experience_level, skills_required, posted_at)
VALUES
  ('11111111-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001',
   'Security Engineer', 'Cloudflare', 'mnc',
   'Protect the internet. Application security, threat modeling, and building tools that secure infrastructure at global scale.',
   'full_time', 'remote', 'Remote', 180000, 250000, 'USD', 'senior',
   ARRAY['Security', 'Python', 'Go', 'Networking', 'Cryptography'],
   now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket
DROP POLICY IF EXISTS "Users can upload own resumes" ON storage.objects;
CREATE POLICY "Users can upload own resumes" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can read own resumes" ON storage.objects;
CREATE POLICY "Users can read own resumes" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own resumes" ON storage.objects;
CREATE POLICY "Users can delete own resumes" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);