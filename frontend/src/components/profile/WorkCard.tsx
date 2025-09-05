'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { WorkExperience } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDateRange } from '@/lib/utils';
import { profileApi } from '@/lib/api';

interface WorkCardProps {
  work: WorkExperience;
  onDelete: () => void;
  onEdit?: (work: WorkExperience) => void;
}

export function WorkCard({ work, onDelete, onEdit }: WorkCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this work experience?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await profileApi.deleteWorkExperience(work.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting work experience:', error);
      alert('Failed to delete work experience. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(work);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow relative group">
      {/* Work Actions */}
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

      {/* Work Content */}
      <div className="pr-20">
        <h4 className="text-lg font-semibold text-gray-900 mb-1">{work.position}</h4>
        <p className="text-gray-700 font-medium mb-2">{work.company}</p>
        <p className="text-gray-500 text-sm mb-4 italic">
          {formatDateRange(work.start_date, work.end_date)}
        </p>
        <p className="text-gray-600 leading-relaxed">{work.description}</p>
      </div>
    </div>
  );
}
