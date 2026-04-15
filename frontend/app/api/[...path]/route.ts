// API Proxy Route - Proxies all /api/* requests to backend
// This keeps the backend private within Docker network

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const backendPath = path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const backendUrl = `${BACKEND_URL}/${backendPath}${
      searchParams ? `?${searchParams}` : ''
    }`;

    // Prepare headers (filter out hop-by-hop headers)
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'transfer-encoding',
      'upgrade',
      'host',
      'te',
      'trailer',
      'proxy-authorization',
      'proxy-authenticate',
      'content-length', // Let fetch calculate this for FormData
    ];

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Skip hop-by-hop headers
      if (!hopByHopHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT, PATCH
    if (method !== 'GET' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        const body = await request.json();
        options.body = JSON.stringify(body);
      } else if (contentType?.includes('multipart/form-data')) {
        // For file uploads, pass FormData directly
        const formData = await request.formData();
        options.body = formData;
        // Remove content-type header to let fetch set it with boundary
        headers.delete('content-type');
      } else {
        const body = await request.text();
        options.body = body;
      }
    }

    // Make request to backend
    const response = await fetch(backendUrl, options);

    // Get response body
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        headers: response.headers,
      });
    } else {
      data = await response.text();
      return new NextResponse(data, {
        status: response.status,
        headers: response.headers,
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to proxy request to backend' },
      { status: 500 }
    );
  }
}
