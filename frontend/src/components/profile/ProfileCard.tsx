'use client';

import { useState } from 'react';
import { 
  Github, 
  Linkedin, 
  Globe, 
  GraduationCap, 
  Edit, 
  Trash2, 
  Plus
} from 'lucide-react';
import { Profile, Project, WorkExperience } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { WorkForm } from '@/components/forms/WorkForm';
import { ProjectEditModal } from '@/components/modals/ProjectEditModal';
import { WorkEditModal } from '@/components/modals/WorkEditModal';
import { SkillTag } from '@/components/profile/SkillTag';
import { ProjectCard } from '@/components/profile/ProjectCard';
import { WorkCard } from '@/components/profile/WorkCard';

interface ProfileCardProps {
  profile: Profile;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

export function ProfileCard({ profile, onEdit, onDelete, onRefresh }: ProfileCardProps) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isProjectEditModalOpen, setIsProjectEditModalOpen] = useState(false);
  const [isWorkEditModalOpen, setIsWorkEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedWork, setSelectedWork] = useState<WorkExperience | null>(null);

  const handleAddProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleAddWork = () => {
    setIsWorkModalOpen(true);
  };

  const handleProjectAdded = () => {
    setIsProjectModalOpen(false);
    onRefresh();
  };

  const handleWorkAdded = () => {
    setIsWorkModalOpen(false);
    onRefresh();
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectEditModalOpen(true);
  };

  const handleEditWork = (work: WorkExperience) => {
    setSelectedWork(work);
    setIsWorkEditModalOpen(true);
  };

  const handleProjectEditSuccess = () => {
    setIsProjectEditModalOpen(false);
    setSelectedProject(null);
    onRefresh();
  };

  const handleWorkEditSuccess = () => {
    setIsWorkEditModalOpen(false);
    setSelectedWork(null);
    onRefresh();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border-l-4 border-l-blue-600 p-8 relative">
        {/* Profile Actions */}
        <div className="absolute top-6 right-6 flex gap-2">
          <Button
            variant="warning"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Header */}
        <div className="pr-24">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{profile.email}</p>

          {/* Social Links */}
          <div className="flex flex-wrap gap-4 mb-6">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                LinkedIn
              </a>
            )}
            {profile.portfolio_url && (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Globe className="h-5 w-5" />
                Portfolio
              </a>
            )}
          </div>

          {/* Education */}
          {profile.education && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Education</span>
              </div>
              <p className="text-gray-700">{profile.education}</p>
            </div>
          )}

          {/* Skills */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>Skills</span>
              <span className="text-sm font-normal text-gray-500">({profile.skills.length})</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <SkillTag
                  key={`skill-${index}-${skill}`}
                  skill={skill}
                  level={profile.skillsWithLevel[index]?.proficiency_level || 1}
                />
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>Projects</span>
                <span className="text-sm font-normal text-gray-500">({profile.projects.length})</span>
              </h3>
              <Button
                variant="success"
                size="sm"
                onClick={handleAddProject}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </div>
            <div className="space-y-4">
              {profile.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => onRefresh()}
                  onEdit={handleEditProject}
                />
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>Work Experience</span>
                <span className="text-sm font-normal text-gray-500">({profile.workExperience.length})</span>
              </h3>
              <Button
                variant="success"
                size="sm"
                onClick={handleAddWork}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {profile.workExperience.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onDelete={() => onRefresh()}
                  onEdit={handleEditWork}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Add Project"
      >
        <ProjectForm
          onSuccess={handleProjectAdded}
          onCancel={() => setIsProjectModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isWorkModalOpen}
        onClose={() => setIsWorkModalOpen(false)}
        title="Add Work Experience"
      >
        <WorkForm
          onSuccess={handleWorkAdded}
          onCancel={() => setIsWorkModalOpen(false)}
        />
      </Modal>

      {/* Edit Modals */}
      <ProjectEditModal
        isOpen={isProjectEditModalOpen}
        onClose={() => {
          setIsProjectEditModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
        onSuccess={handleProjectEditSuccess}
      />

      <WorkEditModal
        isOpen={isWorkEditModalOpen}
        onClose={() => {
          setIsWorkEditModalOpen(false);
          setSelectedWork(null);
        }}
        work={selectedWork}
        onSuccess={handleWorkEditSuccess}
      />
    </>
  );
}
