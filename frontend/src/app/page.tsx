'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/search/SearchBar';
import { StatsCard } from '@/components/stats/StatsCard';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { ProfileForm } from '@/components/forms/ProfileForm';
import { profileApi, searchApi, statsApi } from '@/lib/api';
import { Profile, Stats, SearchResults } from '@/types';

export default function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [profilesData, statsData, skillsData] = await Promise.all([
        profileApi.getAll().catch((err) => {
          console.error('Profiles fetch error:', err);
          return [];
        }),
        statsApi.get().catch((err) => {
          console.error('Stats fetch error:', err);
          return null;
        }),
        searchApi.getAllSkills().catch((err) => {
          console.error('Skills fetch error:', err);
          return { skills: [] };
        }),
      ]);

      setProfiles(profilesData);
      setSelectedProfile(profilesData.length > 0 ? profilesData[0] : null);
      setStats(statsData);
      setSkills([...new Set(skillsData.skills.map(s => s.skill_name))]);
    } catch (err: unknown) {
      console.error('Error loading initial data:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchApi.search(query);
      setSearchResults(results);
    } catch (err: unknown) {
      console.error('Search error:', err);
      setError('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterBySkill = async (skill: string) => {
    if (!skill) {
      setSearchResults(null);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchApi.filterProjectsBySkill(skill);
      // Transform to match SearchResults format
      setSearchResults({
        query: skill,
        type: 'skill',
        results: {
          profiles: [],
          projects: results.projects,
          skills: [],
          workExperience: [],
        },
        pagination: results.pagination,
      });
    } catch (err: unknown) {
      console.error('Filter error:', err);
      setError('Filter failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSort = (sortBy: string) => {
    // This would need backend support for sorting
    console.log('Sorting by:', sortBy);
  };

  const handleRefresh = () => {
    loadInitialData();
  };

  const handleCreateProfile = () => {
    loadInitialData();
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleDeleteProfile = async () => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return;
    }

    try {
      await profileApi.delete();
      setSelectedProfile(null);
    } catch (err: unknown) {
      console.error('Delete error:', err);
      setError('Failed to delete profile');
    }
  };

  const handleProfileUpdated = () => {
    setIsEditModalOpen(false);
    loadInitialData();
  };

  const handleShowStats = () => {
    setIsStatsModalOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      );
    }

    if (searchResults) {
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Search Results for &quot;{searchResults.query}&quot;
            </h2>
            
            {searchResults.results.profiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Profiles</h3>
                <div className="space-y-3">
                  {searchResults.results.profiles.map((profile) => (
                    <div key={profile.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.results.projects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Projects</h3>
                <div className="space-y-3">
                  {searchResults.results.projects.map((project) => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{project.title}</h4>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.results.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {searchResults.results.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {searchResults.results.workExperience.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                <div className="space-y-3">
                  {searchResults.results.workExperience.map((work) => (
                    <div key={work.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{work.position}</h4>
                      <p className="text-gray-600">{work.company}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.values(searchResults.results).every(arr => arr.length === 0) && (
              <p className="text-gray-500 text-center py-8">No results found</p>
            )}
          </div>
        </div>
      );
    }

    if (profiles.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Profiles Found</h3>
            <p className="text-gray-600 mb-6">Create your first profile to get started!</p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Profile
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Profile Selection */}
        {profiles.length > 1 && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedProfile?.id === profile.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Profile */}
        {selectedProfile && (
          <ProfileCard
            profile={selectedProfile}
            onEdit={handleEditProfile}
            onDelete={handleDeleteProfile}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header
        onRefresh={handleRefresh}
        onShowStats={handleShowStats}
        onCreateProfile={handleCreateProfile}
      />

      <div className="container mx-auto px-4 py-8">
        <SearchBar
          onSearch={handleSearch}
          onFilterBySkill={handleFilterBySkill}
          onSort={handleSort}
          skills={skills}
          isLoading={isSearching}
        />

        {stats && <StatsCard stats={stats} />}

        {renderContent()}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Add New Profile"
      >
        <ProfileForm
          onSuccess={handleProfileUpdated}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Stats Modal */}
      <Modal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        title="Statistics"
        size="lg"
      >
        {stats && <StatsCard stats={stats} />}
      </Modal>
    </div>
  );
}