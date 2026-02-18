import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ params, request }) => {
    const { path } = params;

    if (!path) {
        return new Response(JSON.stringify({ error: 'Missing path' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const githubUrl = `https://api.github.com/${path}${searchParams ? '?' + searchParams : ''}`;

    // Robust token detection for Vercel Serverless environment
    let token = import.meta.env.GITHUB_TOKEN;
    if (!token && typeof process !== 'undefined') {
        token = process.env.GITHUB_TOKEN;
    }

    const headers = new Headers();
    headers.set('Accept', 'application/vnd.github.v3+json');
    headers.set('User-Agent', 'Github-Analytics-Generator');

    if (token) {
        const cleanToken = token.startsWith('ghp_') || token.startsWith('github_pat_') ? token : token.trim();
        headers.set('Authorization', `token ${cleanToken}`);
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(githubUrl, {
            method: request.method,
            headers: headers,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        // Get body as ArrayBuffer to handle any content type safely without encoding issues
        const responseData = await response.arrayBuffer();

        const forwardHeaders = new Headers();
        const contentType = response.headers.get('content-type');
        if (contentType) forwardHeaders.set('Content-Type', contentType);

        // Forward important rate limit and link headers
        ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'Link'].forEach(h => {
            const val = response.headers.get(h);
            if (val) forwardHeaders.set(h, val);
        });

        return new Response(responseData, {
            status: response.status,
            headers: forwardHeaders
        });
    } catch (error: any) {
        console.error('Proxy Error:', error);

        const status = error.name === 'AbortError' ? 504 : 500;
        const message = error.name === 'AbortError' ? 'Gateway Timeout' : 'Internal Server Error';

        return new Response(JSON.stringify({
            message,
            error: error?.message || 'Unknown error'
        }), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
