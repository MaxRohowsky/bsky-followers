import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    
    return NextResponse.json({
      displayName: data.displayName,
      handle: data.handle,
      avatar: data.avatar,
      followersCount: data.followersCount,
      followsCount: data.followsCount,
      description: data.description,
    });
  } catch (error) {
    console.error('Error in profile API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}