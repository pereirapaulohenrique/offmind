'use client';

import { useId } from 'react';

/**
 * Logo Probes — Refined exploration of 2 finalists: Open Loop & Nested Layers.
 * Multiple variants of each. Temporary page — remove before production.
 */

// ─────────────────────────────────────────────
// CONCEPT A: The Open Loop
// ─────────────────────────────────────────────
// Mathematically precise elliptical arc.
// Center: (100, 104), rx=72, ry=68 → wider than tall (horizontal calm).
// Gap at upper-right (~55°), from roughly 340° to 35°.
// Uses a single SVG arc command for a perfectly smooth curve.

function OpenLoopA({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`ola-${uid}`}
          x1="148"
          y1="38"
          x2="52"
          y2="168"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="40%" stopColor="#2dd4bf" />
          <stop offset="75%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* Stroke-based open loop — 22px weight, round caps */}
      <path
        d="M 132,40 A 72,68 0 1 0 140,54"
        stroke={`url(#ola-${uid})`}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Variant B: Bolder stroke (28px) for stronger presence
function OpenLoopB({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`olb-${uid}`}
          x1="148"
          y1="38"
          x2="52"
          y2="168"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="35%" stopColor="#2dd4bf" />
          <stop offset="70%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <path
        d="M 132,40 A 72,68 0 1 0 140,54"
        stroke={`url(#olb-${uid})`}
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Variant C: Wider gap (~75°), more deliberate opening
function OpenLoopC({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`olc-${uid}`}
          x1="155"
          y1="42"
          x2="45"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="45%" stopColor="#2dd4bf" />
          <stop offset="80%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* Wider gap: endpoints further apart */}
      <path
        d="M 122,36 A 72,68 0 1 0 148,62"
        stroke={`url(#olc-${uid})`}
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Variant D: Flat teal (no gradient), monochrome strength
function OpenLoopD({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M 122,36 A 72,68 0 1 0 148,62"
        stroke="#2dd4bf"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Variant E: 3D Dimensional — light hitting a tubular ribbon
// ─────────────────────────────────────────────
// Technique: 3 stacked arcs simulating a lit cylinder.
// 1. Shadow layer (offset down-right, darkest teal)
// 2. Body layer (main teal gradient)
// 3. Highlight ridge (thin, lighter teal, inset toward light source)
// Light direction: top-left → bottom-right

function OpenLoop3D({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  // Wide gap arc (same as A3)
  const arc = 'M 122,36 A 72,68 0 1 0 148,62';
  // Shadow arc: slightly larger ellipse, offset down-right
  const shadowArc = 'M 124,39 A 74,70 0 1 0 150,65';
  // Highlight arc: slightly smaller ellipse, offset up-left
  const highlightArc = 'M 120,34 A 70,66 0 1 0 146,59';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Body gradient: full teal spectrum */}
        <linearGradient
          id={`ol3d-body-${uid}`}
          x1="155"
          y1="42"
          x2="45"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="40%" stopColor="#2dd4bf" />
          <stop offset="75%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        {/* Shadow: very dark teal */}
        <linearGradient
          id={`ol3d-shadow-${uid}`}
          x1="155"
          y1="42"
          x2="45"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0d5c53" />
          <stop offset="50%" stopColor="#094741" />
          <stop offset="100%" stopColor="#063a35" />
        </linearGradient>
        {/* Highlight: bright teal-white */}
        <linearGradient
          id={`ol3d-hi-${uid}`}
          x1="155"
          y1="42"
          x2="45"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="40%" stopColor="#6ee7b7" />
          <stop offset="80%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      {/* Layer 1: Shadow — dark, offset, slightly wider */}
      <path
        d={shadowArc}
        stroke={`url(#ol3d-shadow-${uid})`}
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Layer 2: Body — main teal form */}
      <path
        d={arc}
        stroke={`url(#ol3d-body-${uid})`}
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />

      {/* Layer 3: Highlight ridge — thin bright line on the light-facing edge */}
      <path
        d={highlightArc}
        stroke={`url(#ol3d-hi-${uid})`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

// Variant F: 3D with inner glow — softer, more Caregiver warmth
function OpenLoop3DSoft({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  const arc = 'M 122,36 A 72,68 0 1 0 148,62';
  const innerArc = 'M 121,35 A 71,67 0 1 0 147,61';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`ol3s-body-${uid}`}
          x1="155"
          y1="42"
          x2="45"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="40%" stopColor="#2dd4bf" />
          <stop offset="75%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient
          id={`ol3s-glow-${uid}`}
          x1="155"
          y1="42"
          x2="45"
          y2="162"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        {/* Soft outer glow filter */}
        <filter id={`ol3s-blur-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        </filter>
      </defs>

      {/* Soft glow behind — creates depth and ambient light */}
      <path
        d={arc}
        stroke={`url(#ol3s-glow-${uid})`}
        strokeWidth="32"
        strokeLinecap="round"
        fill="none"
        opacity="0.2"
        filter={`url(#ol3s-blur-${uid})`}
      />

      {/* Main body */}
      <path
        d={arc}
        stroke={`url(#ol3s-body-${uid})`}
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner highlight — thin bright edge */}
      <path
        d={innerArc}
        stroke={`url(#ol3s-glow-${uid})`}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    </svg>
  );
}

// Variant G: Faceted 3D — segmented planes like Obsidian's crystalline look
function OpenLoop3DFaceted({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');

  // Break the arc into 6 segments, each a different teal shade
  // simulating faceted planes catching light from top-left
  // Segments go clockwise from the gap start (~upper-right)
  const segments = [
    { d: 'M 122,36 A 72,68 0 0 0 42,48',   color: '#5eead4' },   // top → left: facing light
    { d: 'M 42,48 A 72,68 0 0 0 28,104',    color: '#3ac5b0' },   // left: angled
    { d: 'M 28,104 A 72,68 0 0 0 62,156',   color: '#14b8a6' },   // bottom-left: medium
    { d: 'M 62,156 A 72,68 0 0 0 128,162',  color: '#0d9488' },   // bottom: shadow side
    { d: 'M 128,162 A 72,68 0 0 0 168,120', color: '#0f766e' },   // right-bottom: deep shadow
    { d: 'M 168,120 A 72,68 0 0 0 148,62',  color: '#14b8a6' },   // right: returning to light
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`olf-shadow-${uid}`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.2" />
        </filter>
      </defs>

      <g filter={`url(#olf-shadow-${uid})`}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            stroke={seg.color}
            strokeWidth="24"
            strokeLinecap={i === 0 || i === segments.length - 1 ? 'round' : 'butt'}
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────
// CONCEPT C: The Dual-Arc System
// ─────────────────────────────────────────────
// Two concentric open arcs with OPPOSING gaps.
// Outer arc: R=76, ~290° sweep, gap top-left, full opacity, thick
// Inner arc: R=50, ~290° sweep, gap bottom-right, low opacity, thin
// Core: subtle dot/glow at center
//
// Geometry (center 100,100):
// Outer gap at ~135° (upper-left diagonal), spanning 100°→170° in standard angles
//   Start (170°): (25, 87)  End (100°): (87, 25)  → arc goes CW long way
// Inner gap at ~315° (lower-right diagonal), spanning 280°→350°
//   Start (350°): (149, 109)  End (280°): (109, 149)  → arc goes CW long way

// C1 — Clean base implementation
function DualArcA({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`da-outer-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="30%" stopColor="#14b8a6" />
          <stop offset="60%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <radialGradient
          id={`da-core-${uid}`}
          cx="100" cy="100" r="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Inner arc — background layer, 25% opacity, gap at bottom-right */}
      <path
        d="M 149,109 A 50,50 0 1 1 109,149"
        stroke="#2dd4bf"
        strokeWidth="7"
        strokeLinecap="round"
        strokeOpacity="0.2"
        fill="none"
      />

      {/* Outer arc — active layer, full opacity, gap at top-left */}
      <path
        d="M 25,87 A 76,76 0 1 1 87,25"
        stroke={`url(#da-outer-${uid})`}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* Core glow */}
      <circle cx="100" cy="100" r="18" fill={`url(#da-core-${uid})`} />
      {/* Core dot */}
      <circle cx="100" cy="100" r="3.5" fill="#2dd4bf" fillOpacity="0.45" />
    </svg>
  );
}

// C2 — 3D dimensional (shadow + highlight on outer arc, like A5)
function DualArcB({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`db-outer-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="30%" stopColor="#14b8a6" />
          <stop offset="60%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient
          id={`db-shadow-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#063a35" />
          <stop offset="100%" stopColor="#0d5c53" />
        </linearGradient>
        <linearGradient
          id={`db-hi-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
        <radialGradient
          id={`db-core-${uid}`}
          cx="100" cy="100" r="18"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Inner arc — background, low opacity */}
      <path
        d="M 149,109 A 50,50 0 1 1 109,149"
        stroke="#2dd4bf"
        strokeWidth="7"
        strokeLinecap="round"
        strokeOpacity="0.18"
        fill="none"
      />

      {/* Outer shadow — offset, darker */}
      <path
        d="M 27,89 A 78,78 0 1 1 89,27"
        stroke={`url(#db-shadow-${uid})`}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Outer body */}
      <path
        d="M 25,87 A 76,76 0 1 1 87,25"
        stroke={`url(#db-outer-${uid})`}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* Outer highlight ridge */}
      <path
        d="M 24,85 A 74,74 0 1 1 85,24"
        stroke={`url(#db-hi-${uid})`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* Core */}
      <circle cx="100" cy="100" r="18" fill={`url(#db-core-${uid})`} />
      <circle cx="100" cy="100" r="3.5" fill="#2dd4bf" fillOpacity="0.45" />
    </svg>
  );
}

// C3 — Soft glow (ambient glow behind outer, like A6)
function DualArcC({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`dc-outer-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="30%" stopColor="#14b8a6" />
          <stop offset="60%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient
          id={`dc-glow-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <filter id={`dc-blur-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
        </filter>
        <radialGradient
          id={`dc-core-${uid}`}
          cx="100" cy="100" r="22"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Inner arc */}
      <path
        d="M 149,109 A 50,50 0 1 1 109,149"
        stroke="#2dd4bf"
        strokeWidth="7"
        strokeLinecap="round"
        strokeOpacity="0.18"
        fill="none"
      />

      {/* Outer glow — blurred ambient behind */}
      <path
        d="M 25,87 A 76,76 0 1 1 87,25"
        stroke={`url(#dc-glow-${uid})`}
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
        opacity="0.18"
        filter={`url(#dc-blur-${uid})`}
      />

      {/* Outer body */}
      <path
        d="M 25,87 A 76,76 0 1 1 87,25"
        stroke={`url(#dc-outer-${uid})`}
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* Outer inner-edge highlight */}
      <path
        d="M 24,85 A 74,74 0 1 1 85,24"
        stroke="#5eead4"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />

      {/* Core glow — slightly larger/brighter */}
      <circle cx="100" cy="100" r="22" fill={`url(#dc-core-${uid})`} />
      <circle cx="100" cy="100" r="3" fill="#5eead4" fillOpacity="0.5" />
    </svg>
  );
}

// C4 — Both arcs prominent (inner at 45% opacity, outer slightly thicker)
function DualArcD({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`dd-outer-${uid}`}
          x1="25" y1="87" x2="87" y2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="35%" stopColor="#14b8a6" />
          <stop offset="65%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient
          id={`dd-inner-${uid}`}
          x1="149" y1="109" x2="109" y2="149"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <radialGradient
          id={`dd-core-${uid}`}
          cx="100" cy="100" r="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Inner arc — more visible, gradient, opposing gap */}
      <path
        d="M 149,109 A 50,50 0 1 1 109,149"
        stroke={`url(#dd-inner-${uid})`}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Outer arc */}
      <path
        d="M 25,87 A 76,76 0 1 1 87,25"
        stroke={`url(#dd-outer-${uid})`}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* Core */}
      <circle cx="100" cy="100" r="16" fill={`url(#dd-core-${uid})`} />
      <circle cx="100" cy="100" r="3" fill="#2dd4bf" fillOpacity="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// CONCEPT D: Natural Element Metaphors
// ─────────────────────────────────────────────

// D1 — PEARL: Luminous sphere with layered nacre rings
// A grain of irritation captured, layered over time into something rare.
// Concentric rings with pearlescent gradient = compound growth visible.
function Pearl({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Pearlescent radial — light hitting a sphere from top-left */}
        <radialGradient
          id={`pearl-body-${uid}`}
          cx="78" cy="72" r="80" fx="68" fy="62"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="25%" stopColor="#5eead4" />
          <stop offset="55%" stopColor="#2dd4bf" />
          <stop offset="80%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </radialGradient>
        {/* Highlight — top-left specular reflection */}
        <radialGradient
          id={`pearl-hi-${uid}`}
          cx="72" cy="66" r="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {/* Ambient glow */}
        <radialGradient
          id={`pearl-glow-${uid}`}
          cx="100" cy="100" r="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0" />
          <stop offset="85%" stopColor="#2dd4bf" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="100" cy="100" r="90" fill={`url(#pearl-glow-${uid})`} />

      {/* Nacre layers — concentric rings showing compound growth */}
      <circle cx="100" cy="100" r="72" stroke="#14b8a6" strokeWidth="1" strokeOpacity="0.12" fill="none" />
      <circle cx="100" cy="100" r="58" stroke="#2dd4bf" strokeWidth="0.8" strokeOpacity="0.1" fill="none" />
      <circle cx="100" cy="100" r="44" stroke="#2dd4bf" strokeWidth="0.6" strokeOpacity="0.08" fill="none" />

      {/* Main pearl body */}
      <circle cx="100" cy="100" r="66" fill={`url(#pearl-body-${uid})`} />

      {/* Specular highlight */}
      <circle cx="100" cy="100" r="66" fill={`url(#pearl-hi-${uid})`} />

      {/* Core — the original captured grain */}
      <circle cx="100" cy="104" r="4" fill="#0d9488" fillOpacity="0.4" />
    </svg>
  );
}

// D2 — NAUTILUS: Logarithmic spiral cross-section
// Each chamber built on the previous. Math and nature fused.
function Nautilus({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`naut-g-${uid}`}
          x1="40" y1="160" x2="160" y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="40%" stopColor="#14b8a6" />
          <stop offset="70%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
      </defs>

      {/* Golden spiral — logarithmic curve built from quarter-circle arcs */}
      {/* Each arc has a smaller radius, creating the nautilus chambers */}
      <path
        d={`
          M 100,30
          A 70,70 0 0 1 170,100
          A 55,55 0 0 1 115,155
          A 42,42 0 0 1 73,113
          A 32,32 0 0 1 105,81
          A 24,24 0 0 1 129,105
          A 18,18 0 0 1 111,123
          A 13,13 0 0 1 98,110
          A 9,9  0 0 1 107,101
        `}
        stroke={`url(#naut-g-${uid})`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Chamber dividers — radial lines from spiral center */}
      <line x1="100" y1="30" x2="100" y2="100" stroke="#2dd4bf" strokeWidth="1.5" strokeOpacity="0.12" />
      <line x1="170" y1="100" x2="105" y2="100" stroke="#2dd4bf" strokeWidth="1.5" strokeOpacity="0.1" />
      <line x1="115" y1="155" x2="105" y2="105" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.08" />
      <line x1="73" y1="113" x2="100" y2="105" stroke="#2dd4bf" strokeWidth="1" strokeOpacity="0.07" />

      {/* Core — the innermost chamber */}
      <circle cx="104" cy="104" r="3" fill="#2dd4bf" fillOpacity="0.5" />
    </svg>
  );
}

// D3 — AMBER: Translucent organic shape with a captured element inside
// Captures and preserves. The "nothing dies" metaphor made physical.
function Amber({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Amber-teal hybrid — warm translucency in teal palette */}
        <radialGradient
          id={`amber-body-${uid}`}
          cx="90" cy="85" r="75" fx="80" fy="75"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#2dd4bf" stopOpacity="0.25" />
          <stop offset="75%" stopColor="#14b8a6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0d9488" stopOpacity="0.12" />
        </radialGradient>
        <radialGradient
          id={`amber-hi-${uid}`}
          cx="78" cy="72" r="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Organic amber shape — rounded, slightly irregular */}
      <path
        d="M 100,28 C 140,26 172,52 174,92 C 176,132 156,166 118,172 C 80,178 40,156 32,116 C 24,76 60,30 100,28 Z"
        fill={`url(#amber-body-${uid})`}
        stroke="#2dd4bf"
        strokeWidth="4"
        strokeOpacity="0.5"
      />

      {/* Inner depth — second organic shape */}
      <path
        d="M 102,46 C 132,44 154,64 156,94 C 158,124 142,148 114,152 C 86,156 58,140 52,112 C 46,84 72,48 102,46 Z"
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="1.5"
        strokeOpacity="0.15"
      />

      {/* Captured element — a small thought preserved inside */}
      <circle cx="100" cy="98" r="8" fill="#2dd4bf" fillOpacity="0.3" />
      <circle cx="100" cy="98" r="3" fill="#5eead4" fillOpacity="0.6" />

      {/* Highlight */}
      <path
        d="M 100,28 C 140,26 172,52 174,92 C 176,132 156,166 118,172 C 80,178 40,156 32,116 C 24,76 60,30 100,28 Z"
        fill={`url(#amber-hi-${uid})`}
      />
    </svg>
  );
}

// D4 — MYCELIUM: Underground network of branching nodes
// Scattered nodes silently connecting, sharing, building.
function Mycelium({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient
          id={`myc-fade-${uid}`}
          cx="100" cy="100" r="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="1" />
          <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Network connections — organic branching lines */}
      <g stroke={`url(#myc-fade-${uid})`} strokeLinecap="round">
        {/* Central hub connections */}
        <path d="M 100,100 C 85,80 72,65 55,48" strokeWidth="3" strokeOpacity="0.7" fill="none" />
        <path d="M 100,100 C 120,82 138,68 152,52" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
        <path d="M 100,100 C 80,115 62,130 42,148" strokeWidth="2.5" strokeOpacity="0.5" fill="none" />
        <path d="M 100,100 C 118,118 135,132 155,148" strokeWidth="2" strokeOpacity="0.45" fill="none" />
        <path d="M 100,100 C 100,120 102,140 100,162" strokeWidth="2" strokeOpacity="0.35" fill="none" />
        <path d="M 100,100 C 78,98 60,94 38,92" strokeWidth="2" strokeOpacity="0.4" fill="none" />
        <path d="M 100,100 C 120,96 140,92 164,88" strokeWidth="1.5" strokeOpacity="0.35" fill="none" />

        {/* Secondary branches */}
        <path d="M 55,48 C 48,38 38,30 30,28" strokeWidth="1.5" strokeOpacity="0.3" fill="none" />
        <path d="M 55,48 C 62,40 68,32 72,22" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        <path d="M 152,52 C 160,40 166,30 174,24" strokeWidth="1.5" strokeOpacity="0.25" fill="none" />
        <path d="M 152,52 C 148,38 146,28 140,18" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        <path d="M 42,148 C 34,158 28,166 22,176" strokeWidth="1.5" strokeOpacity="0.2" fill="none" />
        <path d="M 155,148 C 164,158 170,166 178,174" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        <path d="M 38,92 C 28,90 22,86 14,82" strokeWidth="1" strokeOpacity="0.15" fill="none" />
      </g>

      {/* Nodes — each a thought/connection point */}
      <circle cx="100" cy="100" r="6" fill="#2dd4bf" fillOpacity="0.8" />
      <circle cx="55" cy="48" r="4" fill="#2dd4bf" fillOpacity="0.55" />
      <circle cx="152" cy="52" r="3.5" fill="#2dd4bf" fillOpacity="0.5" />
      <circle cx="42" cy="148" r="3.5" fill="#2dd4bf" fillOpacity="0.4" />
      <circle cx="155" cy="148" r="3" fill="#2dd4bf" fillOpacity="0.35" />
      <circle cx="100" cy="162" r="2.5" fill="#2dd4bf" fillOpacity="0.3" />
      <circle cx="38" cy="92" r="2.5" fill="#2dd4bf" fillOpacity="0.3" />
      <circle cx="164" cy="88" r="2" fill="#2dd4bf" fillOpacity="0.25" />

      {/* Tertiary nodes */}
      <circle cx="30" cy="28" r="2" fill="#2dd4bf" fillOpacity="0.2" />
      <circle cx="72" cy="22" r="1.5" fill="#2dd4bf" fillOpacity="0.15" />
      <circle cx="174" cy="24" r="2" fill="#2dd4bf" fillOpacity="0.18" />
      <circle cx="140" cy="18" r="1.5" fill="#2dd4bf" fillOpacity="0.12" />
      <circle cx="22" cy="176" r="1.5" fill="#2dd4bf" fillOpacity="0.12" />
      <circle cx="178" cy="174" r="1.5" fill="#2dd4bf" fillOpacity="0.1" />
    </svg>
  );
}

// D5 — GEODE: Rough exterior cracked open to reveal crystalline interior
// Messy on outside, structured beauty within. The OffMind promise.
function Geode({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`geo-crystal-${uid}`}
          x1="80" y1="60" x2="140" y2="150"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <radialGradient
          id={`geo-glow-${uid}`}
          cx="108" cy="105" r="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rough outer shell — irregular, organic */}
      <path
        d="M 98,24 C 62,22 36,42 28,72 C 20,102 26,136 48,158 C 70,180 108,184 138,170 C 168,156 180,126 178,94 C 176,62 156,34 128,26 C 116,22 106,24 98,24 Z"
        stroke="#2dd4bf"
        strokeWidth="3"
        strokeOpacity="0.2"
        fill="none"
      />

      {/* Crack / opening — the split that reveals the interior */}
      <path
        d="M 68,52 L 78,72 L 70,96 L 82,118 L 72,142"
        stroke="#2dd4bf"
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Inner glow from within */}
      <circle cx="108" cy="105" r="40" fill={`url(#geo-glow-${uid})`} />

      {/* Crystalline facets inside — geometric, structured */}
      {/* Main crystal cluster */}
      <path
        d="M 96,70 L 108,52 L 118,74 Z"
        fill={`url(#geo-crystal-${uid})`}
        fillOpacity="0.9"
      />
      <path
        d="M 118,74 L 134,62 L 138,88 Z"
        fill="#2dd4bf"
        fillOpacity="0.7"
      />
      <path
        d="M 96,70 L 118,74 L 114,98 L 92,94 Z"
        fill="#14b8a6"
        fillOpacity="0.65"
      />
      <path
        d="M 118,74 L 138,88 L 136,112 L 114,98 Z"
        fill="#0d9488"
        fillOpacity="0.55"
      />
      <path
        d="M 92,94 L 114,98 L 110,122 L 88,118 Z"
        fill="#14b8a6"
        fillOpacity="0.45"
      />
      <path
        d="M 114,98 L 136,112 L 130,134 L 110,122 Z"
        fill="#0d9488"
        fillOpacity="0.4"
      />

      {/* Small accent crystals */}
      <path
        d="M 88,118 L 110,122 L 104,140 L 86,136 Z"
        fill="#14b8a6"
        fillOpacity="0.3"
      />
      <path
        d="M 134,62 L 148,72 L 138,88 Z"
        fill="#5eead4"
        fillOpacity="0.4"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// CONCEPT E: Fluorite — Chaos to Order
// ─────────────────────────────────────────────
// Octahedral crystal. Teal-zinc palette. Light from upper-left.
// Each facet is a filled polygon with its own gradient for 3D depth.
// No strokes — edges defined by color contrast between facets.
//
// Octahedron vertices (projected from 3D to 2D, slight above-right view):
//   T (top), B (bottom), F (front), K (back), L (left), R (right)

// E1 — Clean Octahedron: geometric precision, symmetric
function FluoriteA({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Face gradients — each facet gets a directional gradient for curvature feel */}
        <linearGradient id={`e1-tf-${uid}`} x1="100" y1="18" x2="128" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient id={`e1-tr-${uid}`} x1="100" y1="18" x2="172" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={`e1-tk-${uid}`} x1="100" y1="18" x2="72" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={`e1-tl-${uid}`} x1="100" y1="18" x2="28" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id={`e1-bf-${uid}`} x1="128" y1="112" x2="100" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#134e4a" />
        </linearGradient>
        <linearGradient id={`e1-br-${uid}`} x1="172" y1="88" x2="100" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#115e59" />
          <stop offset="100%" stopColor="#1a3a38" />
        </linearGradient>
        <linearGradient id={`e1-bl-${uid}`} x1="28" y1="100" x2="100" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#27272a" />
        </linearGradient>
        <linearGradient id={`e1-bk-${uid}`} x1="72" y1="76" x2="100" y2="182" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1f3634" />
          <stop offset="100%" stopColor="#1f1f23" />
        </linearGradient>
      </defs>

      {/* UPPER FACES (4 triangles from Top vertex to equatorial ring) */}
      {/* Top-Front-Right — brightest, faces light directly */}
      <polygon
        points="100,18 128,112 172,88"
        fill={`url(#e1-tr-${uid})`}
      />
      {/* Top-Front-Left — medium bright */}
      <polygon
        points="100,18 28,100 128,112"
        fill={`url(#e1-tf-${uid})`}
      />
      {/* Top-Back-Right — medium, angled away */}
      <polygon
        points="100,18 172,88 72,76"
        fill={`url(#e1-tk-${uid})`}
      />
      {/* Top-Back-Left — darker, facing away from light */}
      <polygon
        points="100,18 72,76 28,100"
        fill={`url(#e1-tl-${uid})`}
      />

      {/* LOWER FACES (visible ones) */}
      {/* Bottom-Front-Right */}
      <polygon
        points="128,112 172,88 100,182"
        fill={`url(#e1-br-${uid})`}
      />
      {/* Bottom-Front-Left */}
      <polygon
        points="28,100 128,112 100,182"
        fill={`url(#e1-bf-${uid})`}
      />
      {/* Bottom-Back-Right */}
      <polygon
        points="172,88 72,76 100,182"
        fill={`url(#e1-bk-${uid})`}
      />
      {/* Bottom-Back-Left */}
      <polygon
        points="72,76 28,100 100,182"
        fill={`url(#e1-bl-${uid})`}
      />
    </svg>
  );
}

// E2 — Organic Fluorite: slightly asymmetric, softer, more like Paulo's stone image
// Vertices shifted slightly for natural irregularity. Subtle edge highlights.
function FluoriteB({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Slightly warmer gradients, organic feel */}
        <linearGradient id={`e2-a-${uid}`} x1="96" y1="14" x2="135" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient id={`e2-b-${uid}`} x1="96" y1="14" x2="176" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="60%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={`e2-c-${uid}`} x1="96" y1="14" x2="66" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id={`e2-d-${uid}`} x1="96" y1="14" x2="24" y2="104" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="60%" stopColor="#0d7670" />
          <stop offset="100%" stopColor="#0a5c57" />
        </linearGradient>
        <linearGradient id={`e2-e-${uid}`} x1="135" y1="108" x2="104" y2="186" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="50%" stopColor="#0a5c57" />
          <stop offset="100%" stopColor="#27302f" />
        </linearGradient>
        <linearGradient id={`e2-f-${uid}`} x1="176" y1="84" x2="104" y2="186" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a5c57" />
          <stop offset="100%" stopColor="#1a2726" />
        </linearGradient>
        <linearGradient id={`e2-g-${uid}`} x1="24" y1="104" x2="104" y2="186" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#1f1f23" />
        </linearGradient>
        <linearGradient id={`e2-h-${uid}`} x1="66" y1="80" x2="104" y2="186" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a3a39" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
        {/* Subtle edge highlight */}
        <filter id={`e2-glow-${uid}`} x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2dd4bf" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter={`url(#e2-glow-${uid})`}>
        {/* Asymmetric vertices: T(96,14) F(135,108) R(176,84) K(66,80) L(24,104) B(104,186) */}
        {/* Upper faces */}
        <polygon points="96,14 135,108 176,84" fill={`url(#e2-b-${uid})`} />
        <polygon points="96,14 24,104 135,108" fill={`url(#e2-a-${uid})`} />
        <polygon points="96,14 176,84 66,80" fill={`url(#e2-c-${uid})`} />
        <polygon points="96,14 66,80 24,104" fill={`url(#e2-d-${uid})`} />
        {/* Lower faces */}
        <polygon points="135,108 176,84 104,186" fill={`url(#e2-f-${uid})`} />
        <polygon points="24,104 135,108 104,186" fill={`url(#e2-e-${uid})`} />
        <polygon points="176,84 66,80 104,186" fill={`url(#e2-h-${uid})`} />
        <polygon points="66,80 24,104 104,186" fill={`url(#e2-g-${uid})`} />
      </g>

      {/* Subtle edge highlights on the brightest ridges */}
      <line x1="96" y1="14" x2="135" y2="108" stroke="#a7f3d0" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="96" y1="14" x2="176" y2="84" stroke="#5eead4" strokeWidth="0.6" strokeOpacity="0.2" />
      <line x1="135" y1="108" x2="176" y2="84" stroke="#2dd4bf" strokeWidth="0.5" strokeOpacity="0.15" />
    </svg>
  );
}

// E3 — Cleaved Fluorite: the crystal split open, revealing a bright internal plane
// Upper portion is the polished exterior (zinc-teal). The cleave exposes a luminous
// interior face — bright teal. Metaphor: your messy thoughts, processed, reveal value.
function FluoriteC({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Exterior facet gradients */}
        <linearGradient id={`e3-ext1-${uid}`} x1="92" y1="12" x2="168" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={`e3-ext2-${uid}`} x1="92" y1="12" x2="30" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d7670" />
        </linearGradient>
        <linearGradient id={`e3-ext3-${uid}`} x1="92" y1="12" x2="48" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        {/* The cleave face — the bright revealed interior */}
        <linearGradient id={`e3-cleave-${uid}`} x1="30" y1="88" x2="168" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="30%" stopColor="#5eead4" />
          <stop offset="70%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        {/* Lower remnant faces */}
        <linearGradient id={`e3-low1-${uid}`} x1="30" y1="88" x2="100" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="100%" stopColor="#1f1f23" />
        </linearGradient>
        <linearGradient id={`e3-low2-${uid}`} x1="168" y1="78" x2="100" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0a5c57" />
          <stop offset="100%" stopColor="#1a2726" />
        </linearGradient>
        <linearGradient id={`e3-low3-${uid}`} x1="48" y1="68" x2="100" y2="188" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#27302f" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
        {/* Inner glow behind the cleave */}
        <filter id={`e3-glow-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2dd4bf" floodOpacity="0.2" />
        </filter>
      </defs>

      <g filter={`url(#e3-glow-${uid})`}>
        {/* Upper exterior faces (above the cleave line) */}
        {/* Top-right face */}
        <polygon points="92,12 168,78 120,108" fill={`url(#e3-ext1-${uid})`} />
        {/* Top-center face */}
        <polygon points="92,12 120,108 48,68" fill={`url(#e3-ext3-${uid})`} />
        {/* Top-left face */}
        <polygon points="92,12 48,68 30,88" fill={`url(#e3-ext2-${uid})`} />

        {/* THE CLEAVE PLANE — bright exposed interior */}
        {/* This is the key visual moment: the bright face where the crystal was split */}
        <polygon points="30,88 120,108 168,78 140,118" fill={`url(#e3-cleave-${uid})`} />

        {/* Lower faces (below cleave, darker, the base of the crystal) */}
        <polygon points="30,88 140,118 100,188" fill={`url(#e3-low1-${uid})`} />
        <polygon points="140,118 168,78 100,188" fill={`url(#e3-low2-${uid})`} />
        <polygon points="30,88 48,68 100,188" fill={`url(#e3-low3-${uid})`} />
      </g>

      {/* Cleave line highlight — the bright edge where it was split */}
      <line x1="30" y1="88" x2="168" y2="78" stroke="#a7f3d0" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="30" y1="88" x2="140" y2="118" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.3" />
      {/* Top ridge highlights */}
      <line x1="92" y1="12" x2="168" y2="78" stroke="#5eead4" strokeWidth="0.6" strokeOpacity="0.25" />
      <line x1="92" y1="12" x2="30" y2="88" stroke="#2dd4bf" strokeWidth="0.5" strokeOpacity="0.15" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// CONCEPT F: Crystal Cluster — Faceted Gem Mark
// ─────────────────────────────────────────────
// Rebuilt from Paulo's reference SVG. Unified silhouette with 3 crystal peaks
// (the dips between peaks signal "cluster" vs single gem). All facets radiate
// from an interior focal point. Light from upper-left: bright teal → deep zinc.
// Square viewBox. Logo-grade: works at 16px.

// F1 — Cluster Mark: 11 facets, maximum fidelity to reference
// 3 peaks with concavity dips, side + bottom vertices for full facet coverage.
// Outer: TL(50,18) D1(75,32) T(100,6) D2(128,28) TR(154,32) RM(174,94)
//        RB(158,166) BR(126,192) BL(68,194) LB(32,162) LM(20,88)
// Focal: J(96,110)
function ClusterMark({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`cm1-${uid}`} x1="50" y1="18" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" /><stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
        <linearGradient id={`cm2-${uid}`} x1="88" y1="19" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient id={`cm3-${uid}`} x1="100" y1="6" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={`cm4-${uid}`} x1="141" y1="30" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" /><stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={`cm5-${uid}`} x1="35" y1="53" x2="96" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Upper facets — bright, facing light */}
      <polygon points="50,18 75,32 96,110" fill={`url(#cm1-${uid})`} />
      <polygon points="75,32 100,6 96,110" fill={`url(#cm2-${uid})`} />
      <polygon points="100,6 128,28 96,110" fill={`url(#cm3-${uid})`} />
      <polygon points="128,28 154,32 96,110" fill={`url(#cm4-${uid})`} />
      <polygon points="50,18 20,88 96,110" fill={`url(#cm5-${uid})`} />
      {/* Lower facets — progressively darker */}
      <polygon points="20,88 32,162 96,110" fill="#0d9488" />
      <polygon points="32,162 68,194 96,110" fill="#115e59" />
      <polygon points="68,194 126,192 96,110" fill="#134e4a" />
      <polygon points="126,192 158,166 96,110" fill="#0a3d3a" />
      <polygon points="158,166 174,94 96,110" fill="#1a2e2c" />
      <polygon points="174,94 154,32 96,110" fill="#0d9488" />
      {/* Edge highlights on brightest ridges */}
      <line x1="50" y1="18" x2="96" y2="110" stroke="#a7f3d0" strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="100" y1="6" x2="96" y2="110" stroke="#6ee7b7" strokeWidth="0.5" strokeOpacity="0.25" />
      <line x1="75" y1="32" x2="96" y2="110" stroke="#5eead4" strokeWidth="0.4" strokeOpacity="0.2" />
    </svg>
  );
}

// F2 — Gem Mark: 9 facets, clean middle ground
// Same 3-peak silhouette but with side vertices for balanced facets.
// Outer: TL(50,18) D1(75,32) T(100,6) D2(128,28) TR(154,30) RM(174,94)
//        BR(140,190) BL(56,192) LM(22,88)
// Focal: J(98,106)
function GemMark({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`gm1-${uid}`} x1="62" y1="25" x2="98" y2="106" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" /><stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient id={`gm2-${uid}`} x1="100" y1="6" x2="98" y2="106" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={`gm3-${uid}`} x1="141" y1="29" x2="98" y2="106" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" /><stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={`gm4-${uid}`} x1="36" y1="53" x2="98" y2="106" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" /><stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Upper facets — bright */}
      <polygon points="50,18 75,32 98,106" fill={`url(#gm1-${uid})`} />
      <polygon points="75,32 100,6 98,106" fill={`url(#gm2-${uid})`} />
      <polygon points="100,6 128,28 98,106" fill={`url(#gm2-${uid})`} />
      <polygon points="128,28 154,30 98,106" fill={`url(#gm3-${uid})`} />
      {/* Side facets */}
      <polygon points="50,18 22,88 98,106" fill={`url(#gm4-${uid})`} />
      <polygon points="154,30 174,94 98,106" fill="#0d9488" />
      {/* Lower facets — dark */}
      <polygon points="22,88 56,192 98,106" fill="#14b8a6" />
      <polygon points="56,192 140,190 98,106" fill="#115e59" />
      <polygon points="140,190 174,94 98,106" fill="#134e4a" />
      {/* Edge highlights */}
      <line x1="50" y1="18" x2="98" y2="106" stroke="#a7f3d0" strokeWidth="0.6" strokeOpacity="0.3" />
      <line x1="100" y1="6" x2="98" y2="106" stroke="#6ee7b7" strokeWidth="0.5" strokeOpacity="0.25" />
    </svg>
  );
}

// F3 — Crystal Icon: 7 facets, minimal, optimized for favicon/sidebar
// 3 peaks preserved (the cluster identity) but simplified sides.
// Outer: TL(50,18) D1(75,32) T(100,6) D2(128,28) TR(154,30) BR(144,190) BL(54,192)
// Focal: J(100,108)
function CrystalIcon({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`ci1-${uid}`} x1="62" y1="25" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a7f3d0" /><stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <linearGradient id={`ci2-${uid}`} x1="100" y1="6" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
        <linearGradient id={`ci3-${uid}`} x1="141" y1="29" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" /><stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Upper facets — the crystal identity */}
      <polygon points="50,18 75,32 100,108" fill={`url(#ci1-${uid})`} />
      <polygon points="75,32 100,6 100,108" fill={`url(#ci2-${uid})`} />
      <polygon points="100,6 128,28 100,108" fill={`url(#ci2-${uid})`} />
      <polygon points="128,28 154,30 100,108" fill={`url(#ci3-${uid})`} />
      {/* Side + bottom facets — dark mass */}
      <polygon points="50,18 54,192 100,108" fill="#14b8a6" />
      <polygon points="54,192 144,190 100,108" fill="#115e59" />
      <polygon points="144,190 154,30 100,108" fill="#0d9488" />
      {/* Edge highlights */}
      <line x1="50" y1="18" x2="100" y2="108" stroke="#a7f3d0" strokeWidth="0.7" strokeOpacity="0.35" />
      <line x1="100" y1="6" x2="100" y2="108" stroke="#6ee7b7" strokeWidth="0.6" strokeOpacity="0.3" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// CONCEPT B: The Nested Layers
// ─────────────────────────────────────────────
// 3 rounded rectangles, same size (110x110), offset 28px each.
// rx=22 (proportional to product's 1rem at logo scale).
// Stroke-based with progressive opacity.

function LayersA({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`la-inner-${uid}`}
          x1="62"
          y1="62"
          x2="172"
          y2="172"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Outer — whisper */}
      <rect
        x="10"
        y="10"
        width="110"
        height="110"
        rx="22"
        stroke="#2dd4bf"
        strokeWidth="3.5"
        strokeOpacity="0.18"
        fill="none"
      />
      {/* Middle */}
      <rect
        x="38"
        y="38"
        width="110"
        height="110"
        rx="22"
        stroke="#2dd4bf"
        strokeWidth="3.5"
        strokeOpacity="0.45"
        fill="none"
      />
      {/* Inner — full */}
      <rect
        x="66"
        y="66"
        width="110"
        height="110"
        rx="22"
        stroke={`url(#la-inner-${uid})`}
        strokeWidth="4.5"
        fill="none"
      />
    </svg>
  );
}

// Variant B: Filled layers (more visual weight)
function LayersB({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`lb-inner-${uid}`}
          x1="62"
          y1="62"
          x2="178"
          y2="178"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      {/* Outer — whisper fill */}
      <rect
        x="10"
        y="10"
        width="112"
        height="112"
        rx="22"
        fill="#2dd4bf"
        fillOpacity="0.07"
      />
      {/* Middle — medium fill */}
      <rect
        x="38"
        y="38"
        width="112"
        height="112"
        rx="22"
        fill="#2dd4bf"
        fillOpacity="0.18"
      />
      {/* Inner — solid gradient fill */}
      <rect
        x="66"
        y="66"
        width="112"
        height="112"
        rx="22"
        fill={`url(#lb-inner-${uid})`}
      />
    </svg>
  );
}

// Variant C: Mixed — stroked outer two, filled inner
function LayersC({ size = 64 }: { size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={`lc-inner-${uid}`}
          x1="62"
          y1="62"
          x2="178"
          y2="178"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* Outer — stroke only */}
      <rect
        x="10"
        y="10"
        width="112"
        height="112"
        rx="22"
        stroke="#2dd4bf"
        strokeWidth="2.5"
        strokeOpacity="0.15"
        fill="none"
      />
      {/* Middle — stroke only */}
      <rect
        x="38"
        y="38"
        width="112"
        height="112"
        rx="22"
        stroke="#2dd4bf"
        strokeWidth="2.5"
        strokeOpacity="0.35"
        fill="none"
      />
      {/* Inner — filled with gradient */}
      <rect
        x="66"
        y="66"
        width="112"
        height="112"
        rx="22"
        fill={`url(#lc-inner-${uid})`}
        fillOpacity="0.85"
      />
    </svg>
  );
}

// Variant D: Flat monochrome layers (no gradient)
function LayersD({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="10" y="10" width="112" height="112" rx="22"
        stroke="#2dd4bf" strokeWidth="3.5" strokeOpacity="0.15" fill="none"
      />
      <rect
        x="38" y="38" width="112" height="112" rx="22"
        stroke="#2dd4bf" strokeWidth="3.5" strokeOpacity="0.4" fill="none"
      />
      <rect
        x="66" y="66" width="112" height="112" rx="22"
        stroke="#2dd4bf" strokeWidth="4.5" fill="none"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Variant Card Component
// ─────────────────────────────────────────────
function VariantCard({
  label,
  sub,
  Component,
}: {
  label: string;
  sub: string;
  Component: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-satoshi text-lg font-semibold text-zinc-100">
          {label}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
      </div>

      {/* Dark row */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
          Dark
        </p>
        <div className="flex items-end gap-8">
          <div className="text-center">
            <Component size={96} />
            <p className="mt-2 text-[10px] text-zinc-600">96</p>
          </div>
          <div className="text-center">
            <Component size={48} />
            <p className="mt-2 text-[10px] text-zinc-600">48</p>
          </div>
          <div className="text-center">
            <Component size={32} />
            <p className="mt-2 text-[10px] text-zinc-600">32</p>
          </div>
          <div className="text-center">
            <Component size={20} />
            <p className="mt-2 text-[10px] text-zinc-600">20</p>
          </div>
          <div className="text-center">
            <Component size={16} />
            <p className="mt-2 text-[10px] text-zinc-600">16</p>
          </div>
        </div>
        {/* Lockup */}
        <div className="mt-6 flex items-center gap-2.5 border-t border-zinc-800 pt-5">
          <Component size={28} />
          <span className="font-satoshi text-[17px] font-semibold tracking-tight text-zinc-100">
            OffMind
          </span>
        </div>
      </div>

      {/* Light row */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="mb-5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
          Light
        </p>
        <div className="flex items-end gap-8">
          {[96, 48, 32, 20, 16].map((s) => (
            <div key={s} className="text-center">
              <div className="[&_path]:!stroke-teal-700 [&_rect]:!stroke-teal-700 [&_rect[fill]]:!fill-teal-700 [&_circle]:!fill-teal-700">
                <Component size={s} />
              </div>
              <p className="mt-2 text-[10px] text-zinc-400">{s}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2.5 border-t border-zinc-200 pt-5">
          <div className="[&_path]:!stroke-teal-700 [&_rect]:!stroke-teal-700 [&_rect[fill]]:!fill-teal-700 [&_circle]:!fill-teal-700">
            <Component size={28} />
          </div>
          <span className="font-satoshi text-[17px] font-semibold tracking-tight text-zinc-900">
            OffMind
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function LogoProbesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-satoshi text-4xl font-semibold tracking-tight text-zinc-50">
          Logo Refinement
        </h1>
        <p className="mt-3 max-w-lg text-zinc-400">
          Two finalist concepts, four variants each. Shown at 96 → 16px on
          dark and light backgrounds with wordmark lockups.
        </p>

        {/* ───── CONCEPT A: OPEN LOOP ───── */}
        <section className="mt-20">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-teal-400">A</span>
            <div>
              <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
                The Open Loop
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                The mental loop that breaks free. &quot;Off your mind&quot; as a
                visual gesture.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="A3 — Wide Gap (base)"
              sub="22px stroke, ~75° opening, teal gradient"
              Component={OpenLoopC}
            />
            <VariantCard
              label="A5 — 3D Dimensional"
              sub="Shadow + body + highlight ridge. Light from top-left."
              Component={OpenLoop3D}
            />
            <VariantCard
              label="A6 — 3D Soft Glow"
              sub="Ambient glow + body + inner highlight. Warmer, Caregiver feel."
              Component={OpenLoop3DSoft}
            />
            <VariantCard
              label="A7 — 3D Faceted"
              sub="6 segmented planes, each a different teal shade. Obsidian-style crystalline."
              Component={OpenLoop3DFaceted}
            />
          </div>
        </section>

        {/* ───── CONCEPT C: DUAL-ARC SYSTEM ───── */}
        <section className="mt-28">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-teal-400">C</span>
            <div>
              <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
                The Dual-Arc System
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Two concentric arcs with opposing gaps. Outer gap top-left, inner
                gap bottom-right. Rotational tension. Core dot = the mind.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="C1 — Clean"
              sub="Outer gradient 12px + inner 25% opacity 7px + core glow"
              Component={DualArcA}
            />
            <VariantCard
              label="C2 — 3D Dimensional"
              sub="Shadow + body + highlight ridge on outer arc"
              Component={DualArcB}
            />
            <VariantCard
              label="C3 — Soft Glow"
              sub="Ambient glow behind outer + inner highlight + brighter core"
              Component={DualArcC}
            />
            <VariantCard
              label="C4 — Both Prominent"
              sub="Inner at 40% with its own gradient. Outer 14px. Balanced dual presence."
              Component={DualArcD}
            />
          </div>
        </section>

        {/* ───── CONCEPT D: NATURAL ELEMENTS ───── */}
        <section className="mt-28">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-teal-400">D</span>
            <div>
              <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
                Natural Element Metaphors
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Each maps to OffMind&apos;s core: scattered raw material compounded
                into something structured and valuable over time.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="D1 — Pearl"
              sub="A grain of irritation layered into something rare. The 3C loop as nacre."
              Component={Pearl}
            />
            <VariantCard
              label="D2 — Nautilus"
              sub="Logarithmic spiral. Each chamber built on the last. Compound growth."
              Component={Nautilus}
            />
            <VariantCard
              label="D3 — Amber"
              sub="Captures and preserves. Nothing dies — trapped and made permanent."
              Component={Amber}
            />
            <VariantCard
              label="D4 — Mycelium"
              sub="Hidden network silently connecting. The invisible compound layer."
              Component={Mycelium}
            />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="D5 — Geode"
              sub="Rough exterior cracked open to reveal crystalline structure within."
              Component={Geode}
            />
          </div>
        </section>

        {/* ───── CONCEPT E: FLUORITE ───── */}
        <section className="mt-28">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-teal-400">E</span>
            <div>
              <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
                Fluorite — Chaos to Order
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Octahedral crystal geometry. Faceted depth with per-face lighting.
                Raw material becoming structured, valuable form.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="E1 — Clean Octahedron"
              sub="Symmetric 8-facet crystal. Light from upper-left, teal to zinc gradient per face."
              Component={FluoriteA}
            />
            <VariantCard
              label="E2 — Organic Fluorite"
              sub="Asymmetric vertices, edge highlights, subtle ambient glow. More natural, less geometric."
              Component={FluoriteB}
            />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="E3 — Cleaved Fluorite"
              sub="Split open revealing bright interior plane. Messy exterior, crystalline insight within."
              Component={FluoriteC}
            />
          </div>
        </section>

        {/* ───── CONCEPT F: CRYSTAL CLUSTER ───── */}
        <section className="mt-28">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-teal-400">F</span>
            <div>
              <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
                Crystal Cluster — Faceted Gem
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Rebuilt from your reference SVG. Unified silhouette with 3 crystal
                peaks, facets radiating from center. Bright teal to deep zinc.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="F1 — Cluster Mark"
              sub="11 facets, 3 peaks with dips. Maximum fidelity to the reference. Full depth range."
              Component={ClusterMark}
            />
            <VariantCard
              label="F2 — Gem Mark"
              sub="9 facets, same 3-peak silhouette. Cleaner, more geometric. Balanced detail."
              Component={GemMark}
            />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="F3 — Crystal Icon"
              sub="7 facets, minimal. Optimized for favicon and sidebar. Bold contrasts."
              Component={CrystalIcon}
            />
          </div>
        </section>

        {/* ───── CONCEPT B: NESTED LAYERS ───── */}
        <section className="mt-28">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-bold text-teal-400">B</span>
            <div>
              <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
                The Nested Layers
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Compound growth through stacked depth. Thoughts accumulating
                into something real.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <VariantCard
              label="B1 — Stroked"
              sub="3 stroked rounded rects, progressive opacity, gradient inner"
              Component={LayersA}
            />
            <VariantCard
              label="B2 — Filled"
              sub="3 filled rounded rects, progressive opacity, solid inner"
              Component={LayersB}
            />
            <VariantCard
              label="B3 — Hybrid"
              sub="Stroked outer two, filled inner with gradient"
              Component={LayersC}
            />
            <VariantCard
              label="B4 — Flat Mono"
              sub="3 stroked rects, flat teal, no gradient"
              Component={LayersD}
            />
          </div>
        </section>

        {/* ───── DIRECT COMPARISON ───── */}
        <section className="mt-28">
          <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
            Head-to-Head
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Best variant of each concept at sidebar size (28px mark + wordmark).
          </p>
          <div className="mt-8 space-y-4">
            {[
              { label: 'A5 3D Dimensional', C: OpenLoop3D },
              { label: 'A6 3D Soft Glow', C: OpenLoop3DSoft },
              { label: 'C1 Dual-Arc Clean', C: DualArcA },
              { label: 'C2 Dual-Arc 3D', C: DualArcB },
              { label: 'C3 Dual-Arc Glow', C: DualArcC },
              { label: 'C4 Dual-Arc Both', C: DualArcD },
              { label: 'D1 Pearl', C: Pearl },
              { label: 'D2 Nautilus', C: Nautilus },
              { label: 'D3 Amber', C: Amber },
              { label: 'D4 Mycelium', C: Mycelium },
              { label: 'D5 Geode', C: Geode },
              { label: 'E1 Clean Octahedron', C: FluoriteA },
              { label: 'E2 Organic Fluorite', C: FluoriteB },
              { label: 'E3 Cleaved Fluorite', C: FluoriteC },
              { label: 'F1 Cluster Mark', C: ClusterMark },
              { label: 'F2 Gem Mark', C: GemMark },
              { label: 'F3 Crystal Icon', C: CrystalIcon },
            ].map(({ label, C }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-3.5"
              >
                <C size={28} />
                <span className="font-satoshi text-[16px] font-semibold tracking-tight text-zinc-100">
                  OffMind
                </span>
                <span className="ml-auto text-xs text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ───── NAV BAR MOCKUP ───── */}
        <section className="mt-28">
          <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
            Navigation Mockup
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            How each mark looks in a real nav bar context.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { label: 'A5 Single Loop 3D', C: OpenLoop3D },
              { label: 'C1 Dual-Arc Clean', C: DualArcA },
              { label: 'C3 Dual-Arc Glow', C: DualArcC },
              { label: 'C4 Dual-Arc Both', C: DualArcD },
              { label: 'E1 Fluorite Clean', C: FluoriteA },
              { label: 'E2 Fluorite Organic', C: FluoriteB },
              { label: 'E3 Fluorite Cleaved', C: FluoriteC },
              { label: 'F1 Cluster Mark', C: ClusterMark },
              { label: 'F2 Gem Mark', C: GemMark },
              { label: 'F3 Crystal Icon', C: CrystalIcon },
            ].map(({ label, C }) => (
              <div
                key={label}
                className="flex h-14 items-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-5"
              >
                <div className="flex items-center gap-2.5">
                  <C size={24} />
                  <span className="font-satoshi text-[15px] font-semibold tracking-tight text-zinc-100">
                    OffMind
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-6">
                  <span className="text-[13px] text-zinc-400">How it works</span>
                  <span className="text-[13px] text-zinc-400">Pricing</span>
                  <span className="text-[13px] text-zinc-400">FAQ</span>
                  <span className="rounded-md bg-teal-500 px-3.5 py-1.5 text-[13px] font-medium text-zinc-950">
                    Get Access
                  </span>
                </div>
                <span className="ml-6 text-[10px] text-zinc-700">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ───── FAVICON STRIP ───── */}
        <section className="mt-28 mb-24">
          <h2 className="font-satoshi text-2xl font-bold text-zinc-50">
            Favicon Test (actual size)
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            16px — can you still recognize the mark?
          </p>
          <div className="mt-8 flex items-center gap-10">
            {[
              { n: 'A5', C: OpenLoop3D },
              { n: 'A6', C: OpenLoop3DSoft },
              { n: 'C1', C: DualArcA },
              { n: 'C2', C: DualArcB },
              { n: 'C3', C: DualArcC },
              { n: 'C4', C: DualArcD },
              { n: 'D1', C: Pearl },
              { n: 'D2', C: Nautilus },
              { n: 'D4', C: Mycelium },
              { n: 'D5', C: Geode },
              { n: 'E1', C: FluoriteA },
              { n: 'E2', C: FluoriteB },
              { n: 'E3', C: FluoriteC },
              { n: 'F1', C: ClusterMark },
              { n: 'F2', C: GemMark },
              { n: 'F3', C: CrystalIcon },
            ].map(({ n, C }) => (
              <div key={n} className="text-center">
                <div className="inline-flex h-4 w-4 items-center justify-center">
                  <C size={16} />
                </div>
                <p className="mt-3 text-[10px] text-zinc-600">{n}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
