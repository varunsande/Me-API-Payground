'use client';

import { useState } from 'react';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { profileApi } from '@/lib/api';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
  onEdit?: (project: Project) => void;
}

export function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await profileApi.deleteProject(project.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow relative group">
      {/* Project Actions */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="warning"
          size="sm"
          onClick={handleEdit}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Project Content */}
      <div className="pr-20">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h4>
        <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>
        
        {/* Project Links */}
        {project.links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {project.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                {link.name}
              </a>
            ))}
          </div>
        )}

        {/* Project Date */}
        <div className="mt-4 text-sm text-gray-500">
          Created: {formatDate(project.created_at)}
        </div>
      </div>
    </div>
  );
}
