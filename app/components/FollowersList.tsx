'use client';
import { useEffect, useState } from 'react';

interface Follower {
  handle: string;
  displayName?: string;
  followersCount: number;
}

interface FollowersListProps {
  handle: string;
}

export default function FollowersList({ handle }: FollowersListProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFollowers() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/followers?handle=${encodeURIComponent(handle)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch followers');
        }
        
        const data = await response.json();
        setFollowers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchFollowers();
  }, [handle]);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Followers for @{handle} (Sorted by Follower Count)</h2>
      <ul className="space-y-2">
        {followers.map((follower) => (
          <li
            key={follower.handle}
            className="p-4 border rounded hover:bg-gray-50"
          >
            <div className="font-bold">{follower.displayName || follower.handle}</div>
            <div className="text-gray-600">@{follower.handle}</div>
            <div className="text-sm text-gray-500">
              {follower.followersCount.toLocaleString()} followers
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}