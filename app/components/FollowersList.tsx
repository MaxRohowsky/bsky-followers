'use client';
import { useEffect, useState } from 'react';

interface Follower {
  handle: string;
  displayName?: string;
  followersCount: number;
}

interface FollowersListProps {
  handle: string;
  shouldFetch: boolean;
}

export default function FollowersList({ handle, shouldFetch }: FollowersListProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError(null);
        setProcessedCount(0);
        setFollowers([]);

        const response = await fetch(`/api/followers?handle=${encodeURIComponent(handle)}`);
        if (!response.ok) throw new Error('Failed to fetch followers');
        
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Failed to read response');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Process complete messages
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              setFollowers(data);
              setProcessedCount(prev => prev + 1);
            }
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [handle, shouldFetch]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Top 10 followers with highest follower count:</h2>
      <p className="text-sm text-gray-500 mb-4">Note: Due to rate limiting, list populates with delay and may not be complete.</p>
      {loading && (
        <div className="text-center mb-4 text-gray-600">
          Processing... ({processedCount} iterations)
        </div>
      )}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <ul className="space-y-2">
        {followers.map((follower, index) => (
          <li
            key={follower.handle}
            className="p-4 border rounded hover:bg-gray-50 flex"
          >
            <span className="mr-4 font-bold">{index + 1}.</span>
            <div>
              <div className="font-bold">{follower.displayName || follower.handle}</div>
              <div className="text-gray-600">@{follower.handle}</div>
              <div className="text-sm text-gray-500">
                {follower.followersCount.toLocaleString()} followers
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}