import { NextResponse } from 'next/server';

export async function GET() {
    const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

    console.log('YouTube Channel ID:', YOUTUBE_CHANNEL_ID ? 'Present' : 'Missing');
    console.log('YouTube API Key:', YOUTUBE_API_KEY ? 'Present' : 'Missing');

    if (!YOUTUBE_CHANNEL_ID || !YOUTUBE_API_KEY) {
        return NextResponse.json(
            { error: 'Missing YouTube API credentials' },
            { status: 500 }
        );
    }

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CHANNEL_ID}&maxResults=6&order=date&type=video&key=${YOUTUBE_API_KEY}`;

        console.log('YouTube API URL:', url.replace(YOUTUBE_API_KEY, 'API_KEY_HIDDEN'));

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('YouTube API Error Details:', errorData);

            return NextResponse.json(
                {
                    error: 'YouTube API error',
                    status: response.status,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('YouTube API Success, items found:', data.items?.length || 0);

        // Transform the data to extract video IDs properly
        const transformedData = {
            ...data,
            items: data.items?.map((item: any) => ({
                // Extract the video ID from the nested structure
                id: item.id?.videoId || item.id,
                snippet: item.snippet
            })) || []
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error('YouTube API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch YouTube data' },
            { status: 500 }
        );
    }
}
