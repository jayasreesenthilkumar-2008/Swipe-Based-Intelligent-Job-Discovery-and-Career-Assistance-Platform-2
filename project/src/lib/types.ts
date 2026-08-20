export type UserRole = 'seeker' | 'recruiter' | 'admin';

export type JobType = 'full_time' | 'part_time' | 'internship' | 'contract';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';
export type CompanyType = 'mnc' | 'startup' | 'new_startup';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead';
export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'interview'
  | 'shortlisted'
  | 'rejected'
  | 'offer';
export type SwipeDirection = 'left' | 'right';
export type NotificationType =
  | 'info'
  | 'match'
  | 'competition'
  | 'startup'
  | 'application'
  | 'interview';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string;
  skills: string[];
  experience_years: number;
  education: string;
  bio: string;
  portfolio_links: string[];
  location: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  company: string;
  company_type: CompanyType;
  description: string;
  job_type: JobType;
  work_mode: WorkMode;
  location: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  experience_level: ExperienceLevel;
  skills_required: string[];
  posted_at: string;
  is_active: boolean;
  created_at: string;
}

export interface Swipe {
  id: string;
  user_id: string;
  job_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  applied_at: string | null;
  updated_at: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  version: number;
  parsed_skills: string[];
  parsed_text: string;
  ats_score: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link_id: string | null;
  created_at: string;
}

export interface JobWithMatch extends Job {
  match_score?: number;
  applicant_count?: number;
  swipe_direction?: SwipeDirection;
}
