import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ params, request }) => {
    const path = params.path;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    const githubUrl = `https://api.github.com/${path}${searchParams ? '?' + searchParams : ''}`;

    const headers = new Headers();
    headers.set('Accept', 'application/vnd.github.v3+json');
    headers.set('User-Agent', 'Github-Analytics-Generator');

    // Use GITHUB_TOKEN if available in environment variables
    const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
    if (token) {
        headers.set('Authorization', `token ${token}`);
    }

    try {
        const response = await fetch(githubUrl, {
            method: request.method,
            headers: headers,
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                // Forward pagination and rate limit headers if present
                'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit') || '',
                'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining') || '',
                'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset') || '',
                'Link': response.headers.get('Link') || '',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
