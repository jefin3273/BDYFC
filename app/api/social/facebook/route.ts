import { NextResponse } from 'next/server';

export async function GET() {
  const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
  const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${FACEBOOK_PAGE_ID}/posts?fields=id,message,full_picture,permalink_url,created_time&limit=6&access_token=${FACEBOOK_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Facebook API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Facebook data' }, { status: 500 });
  }
}
