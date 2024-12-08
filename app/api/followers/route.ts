import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    // Get followers
    const followersResponse = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.graph.getFollowers?actor=${handle}`
    );
    
    if (!followersResponse.ok) {
      throw new Error('Failed to fetch followers');
    }

    const followersData = await followersResponse.json();
    
    // Get profile info for each follower (in batches to avoid rate limiting)
    const followers = followersData.followers;
    const batchSize = 5;
    const enrichedFollowers = [];
    
    for (let i = 0; i < followers.length; i += batchSize) {
      const batch = followers.slice(i, i + batchSize);
      const profilePromises = batch.map(async (follower: any) => {
        const profileResponse = await fetch(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${follower.handle}`
        );
        const profile = await profileResponse.json();
        return {
          handle: follower.handle,
          displayName: profile.displayName,
          followersCount: profile.followersCount || 0,
        };
      });
      
      const batchResults = await Promise.all(profilePromises);
      enrichedFollowers.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < followers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Sort by followers count
    const sortedFollowers = enrichedFollowers.sort(
      (a, b) => b.followersCount - a.followersCount
    );

    return NextResponse.json(sortedFollowers);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers data' },
      { status: 500 }
    );
  }
} 