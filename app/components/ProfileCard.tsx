'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProfileCardProps {
  handle: string;
}

interface Profile {
  displayName: string;
  handle: string;
  avatar: string;
  followersCount: number;
  followsCount: number;
  description: string;
}

export default function ProfileCard({ handle }: ProfileCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/profile?handle=${encodeURIComponent(handle)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [handle]);

  if (loading) return <div className="text-center">Loading profile...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!profile) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20">
          <Image
            src={profile.avatar}
            alt={profile.displayName}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">{profile.displayName}</h2>
          <p className="text-gray-600">@{profile.handle}</p>
        </div>
      </div>
      
      <p className="mt-4 text-gray-700">{profile.description}</p>
      
      <div className="mt-4 flex space-x-4 text-sm text-gray-600">
        <div>
          <span className="font-bold">{profile.followersCount.toLocaleString()}</span> followers
        </div>
        <div>
          <span className="font-bold">{profile.followsCount.toLocaleString()}</span> following
        </div>
      </div>
    </div>
  );
}