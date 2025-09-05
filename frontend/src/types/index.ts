export interface Profile {
  id: number;
  name: string;
  email: string;
  education?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
  skills: string[];
  skillsWithLevel: SkillWithLevel[];
  projects: Project[];
  workExperience: WorkExperience[];
}

export interface SkillWithLevel {
  skill_name: string;
  proficiency_level: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  links: ProjectLink[];
  created_at: string;
}

export interface ProjectLink {
  name: string;
  url: string;
}

export interface WorkExperience {
  id: number;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
}

export interface Stats {
  total_profiles: number;
  total_projects: number;
  unique_skills: number;
  total_work_experience: number;
  topSkills: TopSkill[];
}

export interface TopSkill {
  name: string;
  frequency: number;
}

export interface SearchResults {
  query: string;
  type: string;
  results: {
    profiles: Profile[];
    projects: Project[];
    skills: SkillWithLevel[];
    workExperience: WorkExperience[];
  };
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface ProjectFilter {
  projects: Project[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SkillsResponse {
  skills: SkillWithLevel[];
}

export interface ApiError {
  error: string;
  code?: string;
  stack?: string;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  currentPage?: number;
  totalPages?: number;
}
