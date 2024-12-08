import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    // Get all followers
    const followersResponse = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.graph.getFollowers?actor=${handle}&limit=100`
    );
    
    if (!followersResponse.ok) {
      throw new Error('Failed to fetch followers');
    }

    const followersData = await followersResponse.json();
    const followers = followersData.followers;
    const enrichedFollowers = [];
    
    // Create a Response.stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start the stream
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    // Process followers and send updates
    (async () => {
      try {
        for (const follower of followers) {
          try {
            const profileResponse = await fetch(
              `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${follower.handle}`
            );
            
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              enrichedFollowers.push({
                handle: follower.handle,
                displayName: profile.displayName,
                followersCount: profile.followersCount || 0,
              });

              // Sort and get top 10 for each update
              const topFollowers = [...enrichedFollowers]
                .sort((a, b) => b.followersCount - a.followersCount)
                .slice(0, 10);

              // Send the update
              await writer.write(
                encoder.encode(`data: ${JSON.stringify(topFollowers)}\n\n`)
              );
            }
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error fetching profile for ${follower.handle}:`, error);
            continue;
          }
        }

        // Close the stream
        await writer.close();
      } catch (error) {
        console.error('Stream error:', error);
        await writer.abort(error);
      }
    })();

    return response;
    
  } catch (error) {
    console.error('Error in followers API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followers' }, 
      { status: 500 }
    );
  }
} 