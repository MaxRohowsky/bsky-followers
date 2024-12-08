'use client';
import { useState } from 'react';
import FollowersList from './components/FollowersList';
import ProfileCard from './components/ProfileCard';

export default function Home() {
  const [handle, setHandle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShouldFetch(true);
  };

  const handleCancel = () => {
    setShouldFetch(false);
    setSubmitted(false);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Your Top 10 Bluesky followers with most followers
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label className="block mb-2">Bluesky Handle (without @)</label>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="handle.bsky.social"
            required
          />
        </div>
        {!submitted ? (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Show Followers
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        )}
      </form>

      {submitted && handle && (
        <div className="space-y-8 mt-8">
          <ProfileCard handle={handle} />
          <FollowersList handle={handle} shouldFetch={shouldFetch} />
        </div>
      )}
    </main>
  );
} 