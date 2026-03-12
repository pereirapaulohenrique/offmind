import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'OffMind — Where scattered thoughts become real things.';
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
          backgroundColor: '#faf9f7',
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
            background: 'radial-gradient(circle, rgba(194,122,90,0.06) 0%, transparent 70%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M 72 28 A 36 38 0 1 0 80 40"
                fill="none"
                stroke="#333332"
                strokeWidth="11"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1c1b1a',
                letterSpacing: '-0.02em',
              }}
            >
              offmind
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '9999px',
              border: '1px solid rgba(194,122,90,0.3)',
              backgroundColor: 'rgba(194,122,90,0.08)',
            }}
          >
            <span style={{ fontSize: '14px', color: '#c27a5a', fontWeight: 500 }}>
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
              color: '#1c1b1a',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: 0,
              maxWidth: '900px',
            }}
          >
            Where scattered thoughts
            <br />
            <span style={{ color: '#c27a5a' }}>become real things.</span>
          </h1>

          <p
            style={{
              fontSize: '22px',
              color: '#6b6560',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '700px',
            }}
          >
            A personal workspace for minds with too many tabs open.
            Capture from anywhere, route with AI, compound into action.
          </p>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            paddingTop: '24px',
          }}
        >
          <span style={{ fontSize: '16px', color: '#8c8680' }}>
            getoffmind.com
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span style={{ fontSize: '14px', color: '#a09890' }}>
              Capture
            </span>
            <span style={{ fontSize: '14px', color: '#a09890' }}>
              Route
            </span>
            <span style={{ fontSize: '14px', color: '#a09890' }}>
              Compound
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
