import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OffMind — Your mind captures everything. OffMind organizes it.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#09090b',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-200px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top bar: logo + badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
          }}
        >
          {/* Logo mark: infinity symbol */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <svg
              width="48"
              height="28"
              viewBox="0 0 48 28"
              fill="none"
            >
              <path
                d="M14 4C8.48 4 4 8.48 4 14s4.48 10 10 10c3.51 0 6.58-1.81 8.35-4.55l1.65-2.7 1.65 2.7C27.42 22.19 30.49 24 34 24c5.52 0 10-4.48 10-10S39.52 4 34 4c-3.51 0-6.58 1.81-8.35 4.55L24 11.25l-1.65-2.7C20.58 5.81 17.51 4 14 4zm0 4c2.21 0 4.16 1.14 5.28 2.86L24 17.75l4.72-6.89C29.84 9.14 31.79 8 34 8c3.31 0 6 2.69 6 6s-2.69 6-6 6c-2.21 0-4.16-1.14-5.28-2.86L24 10.25l-4.72 6.89C18.16 18.86 16.21 20 14 20c-3.31 0-6-2.69-6-6s2.69-6 6-6z"
                fill="#2dd4bf"
              />
            </svg>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#fafafa',
                letterSpacing: '-0.02em',
              }}
            >
              OffMind
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '9999px',
              border: '1px solid rgba(45,212,191,0.3)',
              backgroundColor: 'rgba(45,212,191,0.08)',
            }}
          >
            <span style={{ fontSize: '14px', color: '#2dd4bf', fontWeight: 500 }}>
              Founding Member Access Open
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 700,
              color: '#fafafa',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: 0,
              maxWidth: '900px',
            }}
          >
            Your mind captures everything.
            <br />
            <span style={{ color: '#2dd4bf' }}>OffMind organizes it.</span>
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#a1a1aa',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '700px',
            }}
          >
            AI-powered productivity for overthinkers. Capture from anywhere,
            let AI organize, commit to today.
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #27272a',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: '16px', color: '#71717a' }}>
            getoffmind.com
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '14px', color: '#52525b' }}>
              Next.js
            </span>
            <span style={{ fontSize: '14px', color: '#52525b' }}>
              Supabase
            </span>
            <span style={{ fontSize: '14px', color: '#52525b' }}>
              AI-Powered
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
