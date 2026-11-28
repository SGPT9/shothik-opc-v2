import { NextResponse } from 'next/server';

// Force dynamic rendering to ensure fresh health data
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      service: 'deerflow',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    const unhealthy = {
      status: 'unhealthy',
      service: 'deerflow',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(unhealthy, { status: 503 });
  }
}
