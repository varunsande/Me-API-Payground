'use client';

import { useState } from 'react';
import { Code, RefreshCw, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProfileForm } from '@/components/forms/ProfileForm';

interface HeaderProps {
  onRefresh: () => void;
  onShowStats: () => void;
  onCreateProfile: () => void;
}

export function Header({ onRefresh, onShowStats, onCreateProfile }: HeaderProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateProfile = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleProfileCreated = () => {
    setIsCreateModalOpen(false);
    onCreateProfile();
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <Code className="h-10 w-10" />
              Me-API Playground
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light">
              Personal Profile API with Advanced Search & Management Capabilities
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Code className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Profile Manager</h2>
                  <p className="text-white/80 text-sm">Manage your professional profile</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleCreateProfile}
                  variant="success"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Profile
                </Button>
                <Button
                  onClick={onRefresh}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  onClick={onShowStats}
                  variant="warning"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Statistics
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create Profile"
      >
        <ProfileForm
          onSuccess={handleProfileCreated}
          onCancel={handleCloseModal}
        />
      </Modal>
    </>
  );
}
