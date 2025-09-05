'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { profileApi } from '@/lib/api';
import { Profile } from '@/types';
import { Plus, Trash2, X } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  education: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    links: Array<{ name: string; url: string }>;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    description: string;
  }>;
}

interface ProfileFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<Profile>;
}

interface Skill {
  name: string;
  level: number;
}

interface Project {
  title: string;
  description: string;
  links: Array<{ name: string; url: string }>;
}

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date: string | undefined;
  description: string;
}

export function ProfileForm({ onSuccess, onCancel, initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    education: initialData?.education || '',
    github_url: initialData?.github_url || '',
    linkedin_url: initialData?.linkedin_url || '',
    portfolio_url: initialData?.portfolio_url || '',
  });

  const [skills, setSkills] = useState<Skill[]>(
    initialData?.skills?.map((skill, index) => ({
      name: skill,
      level: initialData?.skillsWithLevel?.[index]?.proficiency_level || 1
    })) || []
  );

  const [projects, setProjects] = useState<Project[]>(
    initialData?.projects?.map(project => ({
      title: project.title,
      description: project.description,
      links: project.links || []
    })) || []
  );

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    initialData?.workExperience?.map(work => ({
      company: work.company,
      position: work.position,
      start_date: work.start_date,
      end_date: work.end_date,
      description: work.description
    })) || []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Skills management
  const addSkill = () => {
    setSkills([...skills, { name: '', level: 1 }]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkills(updatedSkills);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Projects management
  const addProject = () => {
    setProjects([...projects, { title: '', description: '', links: [] }]);
  };

  const updateProject = (index: number, field: keyof Project, value: string | Array<{ name: string; url: string }>) => {
    const updatedProjects = [...projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setProjects(updatedProjects);
  };

  const addProjectLink = (projectIndex: number) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].links.push({ name: '', url: '' });
    setProjects(updatedProjects);
  };

  const updateProjectLink = (projectIndex: number, linkIndex: number, field: 'name' | 'url', value: string) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].links[linkIndex] = { ...updatedProjects[projectIndex].links[linkIndex], [field]: value };
    setProjects(updatedProjects);
  };

  const removeProjectLink = (projectIndex: number, linkIndex: number) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].links = updatedProjects[projectIndex].links.filter((_, i) => i !== linkIndex);
    setProjects(updatedProjects);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Work experience management
  const addWorkExperience = () => {
    setWorkExperience([...workExperience, { company: '', position: '', start_date: '', end_date: '', description: '' }]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updatedWork = [...workExperience];
    updatedWork[index] = { ...updatedWork[index], [field]: value };
    setWorkExperience(updatedWork);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Validate skills
    skills.forEach((skill, index) => {
      if (!skill.name.trim()) {
        newErrors[`skill_${index}`] = 'Skill name is required';
      }
    });

    // Validate projects
    projects.forEach((project, index) => {
      if (!project.title.trim()) {
        newErrors[`project_title_${index}`] = 'Project title is required';
      }
      if (!project.description.trim()) {
        newErrors[`project_desc_${index}`] = 'Project description is required';
      }
    });

    // Validate work experience
    workExperience.forEach((work, index) => {
      if (!work.company.trim()) {
        newErrors[`work_company_${index}`] = 'Company is required';
      }
      if (!work.position.trim()) {
        newErrors[`work_position_${index}`] = 'Position is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const profileData: ProfileFormData = {
        ...formData,
        skills: skills.map(skill => skill.name).filter(name => name.trim()),
        projects: projects
          .filter(project => project.title.trim() && project.description.trim())
          .map(project => ({
            title: project.title,
            description: project.description,
            links: project.links
          })),
        workExperience: workExperience
          .filter(work => work.company.trim() && work.position.trim())
          .map(work => ({
            company: work.company,
            position: work.position,
            start_date: work.start_date,
            end_date: work.end_date || '',
            description: work.description
          }))
      };

      // Always create new profile
      await profileApi.create(profileData as any);
      onSuccess();
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const err = error as { response?: { data?: { error?: string } } };
      setErrors({ general: err.response?.data?.error || 'Failed to save profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
              Education
            </label>
            <input
              type="text"
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bachelor's in Computer Science"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolio_url"
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={addSkill}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </Button>
          </div>
          <div className="space-y-4">
            {skills.map((skill, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(index, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`skill_${index}`] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., JavaScript, Python, React"
                  />
                  {errors[`skill_${index}`] && (
                    <p className="mt-1 text-sm text-red-600">{errors[`skill_${index}`]}</p>
                  )}
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={skill.level}
                    onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Beginner</option>
                    <option value={2}>Intermediate</option>
                    <option value={3}>Advanced</option>
                    <option value={4}>Expert</option>
                    <option value={5}>Master</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeSkill(index)}
                  className="h-10 w-10 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={addProject}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </div>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Project {index + 1}</h4>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeProject(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`project_title_${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter project title"
                    />
                    {errors[`project_title_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`project_title_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`project_desc_${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe your project"
                    />
                    {errors[`project_desc_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`project_desc_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Project Links
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addProjectLink(index)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Link
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {project.links.map((link, linkIndex) => (
                        <div key={linkIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={link.name}
                            onChange={(e) => updateProjectLink(index, linkIndex, 'name', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Link name (e.g., GitHub, Live Demo)"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateProjectLink(index, linkIndex, 'url', e.target.value)}
                            className="flex-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com"
                          />
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeProjectLink(index, linkIndex)}
                            className="h-10 w-10 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
            <Button
              type="button"
              variant="success"
              size="sm"
              onClick={addWorkExperience}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Experience
            </Button>
          </div>
          <div className="space-y-6">
            {workExperience.map((work, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Experience {index + 1}</h4>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeWorkExperience(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={work.company}
                      onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`work_company_${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Company name"
                    />
                    {errors[`work_company_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`work_company_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={work.position}
                      onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors[`work_position_${index}`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Job title"
                    />
                    {errors[`work_position_${index}`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`work_position_${index}`]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="month"
                      value={work.start_date}
                      onChange={(e) => updateWorkExperience(index, 'start_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="month"
                      value={work.end_date}
                      onChange={(e) => updateWorkExperience(index, 'end_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={work.description}
                    onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your role and responsibilities"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Create Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
