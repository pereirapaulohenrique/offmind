#!/usr/bin/env node
// sync-roadmap.js — Parses PRODUCT-SPEC.md and patches offmind-roadmap.html
// No external dependencies. Uses only Node.js built-in fs and path.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPEC_PATH = path.join(ROOT, 'docs', 'PRODUCT-SPEC.md');
const HTML_PATH = path.join(ROOT, 'offmind-roadmap.html');
const JSON_PATH = path.join(ROOT, 'docs', 'roadmap-data.json');

// Tier metadata (matches existing HTML design)
const TIER_META = {
  t1:  { title: 'T1 \u2014 Launch Gate',        icon: '\u{1F6A8}', color: 'var(--red-500)',    desc: 'Cannot launch without these' },
  t2:  { title: 'T2 \u2014 Premium Baseline',   icon: '\u2728',    color: 'var(--orange-500)', desc: "Without this, product doesn't justify $79+" },
  t3:  { title: 'T3 \u2014 Retention & Habits', icon: '\u{1F504}', color: 'var(--teal-500)',   desc: 'Without this, users churn after month 1' },
  t4:  { title: 'T4 \u2014 Differentiation',    icon: '\u{1F9E0}', color: 'var(--purple-400)', desc: 'What makes OffMind unique vs. competitors' },
  t5:  { title: 'T5 \u2014 Scale & Ecosystem',  icon: '\u{1F30D}', color: 'var(--blue-400)',   desc: 'Post-product-market-fit' },
  mkt: { title: 'Marketing & Launch',            icon: '\u{1F4E3}', color: 'var(--amber-500)',  desc: '30-day launch playbook' },
};

// ── Status normalization ──────────────────────────────────────────────

function normalizeStatus(raw) {
  const s = raw.trim().toLowerCase();
  if (s.includes('done')) return 'done';
  if (s.startsWith('blocked') || s.includes('blocked on')) return 'blocked';
  if (s.startsWith('deferred')) return 'deferred';
  if (s.startsWith('in progress')) return 'in_progress';
  return 'not_started';
}

function normalizeOwner(raw) {
  const s = raw.trim().toLowerCase();
  if (s === 'both') return 'both';
  if (s === 'paulo') return 'paulo';
  return 'claude';
}

// ── Spec parser ───────────────────────────────────────────────────────

function parseSpec(content) {
  const lines = content.split('\n');
  const tiers = {}; // { [tierId]: { sections: [{ label, items }] } }

  let currentTier = null;
  let currentSection = null;
  let pendingItem = null;

  const IGNORE_HEADINGS = ['how to use', 'implementation plan', 'effort summary', 'conventions'];

  function flushPending() {
    if (pendingItem) {
      addItem(tiers, pendingItem.tier, pendingItem.section, pendingItem.item);
      pendingItem = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── ## headings (tier-level) ─────────────────────────────────────
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      flushPending();
      const heading = h2Match[1].trim();

      // Tier heading: "T1 — Launch Gate" or sub-heading: "T1 Infrastructure Checklist"
      const tierMatch = heading.match(/^T([1-5])\s/);
      if (tierMatch) {
        const tierId = 't' + tierMatch[1];
        if (!tiers[tierId]) tiers[tierId] = { sections: [] };

        if (heading.match(/^T[1-5]\s+\u2014\s/)) {
          // Main tier heading
          currentTier = tierId;
          currentSection = null;
        } else {
          // Sub-heading within same tier (e.g., "T1 Infrastructure Checklist")
          currentTier = tierId;
          currentSection = heading.replace(/^T[1-5]\s+/, '');
        }
        continue;
      }

      // Marketing tier
      if (heading.match(/^Marketing/i)) {
        currentTier = 'mkt';
        currentSection = null;
        if (!tiers['mkt']) tiers['mkt'] = { sections: [] };
        continue;
      }

      // Ignored meta sections
      if (IGNORE_HEADINGS.some(h => heading.toLowerCase().startsWith(h))) {
        currentTier = null;
        currentSection = null;
        continue;
      }

      continue;
    }

    if (!currentTier) continue;

    // ── ### and #### headings ────────────────────────────────────────
    const h34Match = line.match(/^(#{3,4})\s+(.+)$/);
    if (h34Match) {
      flushPending();
      const heading = h34Match[2].trim();

      // OM-XXX item heading
      const omMatch = heading.match(/^(OM-\d{3}):\s+(.+)$/);
      if (omMatch) {
        pendingItem = {
          tier: currentTier,
          section: currentSection,
          item: { id: omMatch[1], title: omMatch[2], owner: 'claude', status: 'not_started', note: '' },
        };
        continue;
      }

      // Section label
      currentSection = heading;
      continue;
    }

    // ── OM item metadata lines ───────────────────────────────────────
    if (pendingItem) {
      const ownerMatch = line.match(/\*\*Owner:\*\*\s*([^|*]+)/i);
      if (ownerMatch) {
        pendingItem.item.owner = normalizeOwner(ownerMatch[1]);
        continue;
      }

      const statusMatch = line.match(/\*\*Status:\*\*\s*(.+)$/i);
      if (statusMatch) {
        pendingItem.item.status = normalizeStatus(statusMatch[1]);
        continue;
      }
    }

    // ── Table rows (INF/MKT/LCH items) ──────────────────────────────
    const tableMatch = line.match(/^\|\s*((?:INF|MKT|LCH)-\d{3})\s*\|/);
    if (tableMatch && currentTier) {
      flushPending();
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 4) {
        addItem(tiers, currentTier, currentSection, {
          id: cells[0],
          title: cells[1],
          owner: normalizeOwner(cells[2]),
          status: normalizeStatus(cells[3]),
          note: '',
        });
      }
    }
  }

  flushPending();
  return tiers;
}

function addItem(tiers, tierId, sectionLabel, item) {
  if (!tiers[tierId]) tiers[tierId] = { sections: [] };
  const label = sectionLabel || 'Items';
  let section = tiers[tierId].sections.find(s => s.label === label);
  if (!section) {
    section = { label, items: [] };
    tiers[tierId].sections.push(section);
  }
  section.items.push(item);
}

// ── Convert to DATA format ────────────────────────────────────────────

function toDataFormat(tiers) {
  const order = ['t1', 't2', 't3', 't4', 't5', 'mkt'];
  return order.filter(id => tiers[id]).map(id => {
    const meta = TIER_META[id];
    return {
      id,
      title: meta.title,
      icon: meta.icon,
      color: meta.color,
      desc: meta.desc,
      sections: tiers[id].sections.map(sec => ({
        label: sec.label,
        items: sec.items.map(item => ({
          id: item.id,
          title: item.title,
          owner: item.owner,
          done: item.status === 'done',
          blocked: item.status === 'blocked',
          deferred: item.status === 'deferred',
          inprogress: item.status === 'in_progress',
          note: item.note || '',
        })),
      })),
    };
  });
}

// ── HTML patching ─────────────────────────────────────────────────────

function patchHTML(data) {
  let html = fs.readFileSync(HTML_PATH, 'utf-8');

  // Find `const DATA = [` and its matching `];`
  const startMarker = 'const DATA = [';
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) {
    console.error('ERROR: Could not find "const DATA = [" in HTML');
    process.exit(1);
  }

  // Track bracket depth to find the closing ];
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  let endIdx = -1;

  for (let i = startIdx + startMarker.length - 1; i < html.length; i++) {
    const ch = html[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (inString) { if (ch === stringChar) inString = false; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inString = true; stringChar = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) {
        // Look for the semicolon after ]
        let j = i + 1;
        while (j < html.length && html[j] === ' ') j++;
        if (html[j] === ';') { endIdx = j + 1; break; }
      }
    }
  }

  if (endIdx === -1) {
    console.error('ERROR: Could not find matching ]; for DATA array');
    process.exit(1);
  }

  // Replace the DATA block with fresh JSON
  const dataStr = JSON.stringify(data, null, 2);
  const newBlock = 'const DATA = ' + dataStr + ';';
  html = html.substring(0, startIdx) + newBlock + html.substring(endIdx);

  // Update sync timestamp in header meta
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  html = html.replace(/<span>Spec v2[^<]*<\/span>/, `<span>Spec v2 \u00b7 synced ${now}</span>`);

  fs.writeFileSync(HTML_PATH, html, 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────────────

function main() {
  console.log('sync-roadmap: Reading PRODUCT-SPEC.md...');
  const spec = fs.readFileSync(SPEC_PATH, 'utf-8');
  const tiers = parseSpec(spec);
  const data = toDataFormat(tiers);

  // Stats
  let total = 0, done = 0, blocked = 0, deferred = 0, inprogress = 0;
  data.forEach(t => t.sections.forEach(s => s.items.forEach(item => {
    total++;
    if (item.done) done++;
    if (item.blocked) blocked++;
    if (item.deferred) deferred++;
    if (item.inprogress) inprogress++;
  })));

  const notStarted = total - done - blocked - deferred - inprogress;

  console.log(`\nParsed ${data.length} tiers, ${total} items:`);
  console.log(`  \u2713 Done:        ${done}`);
  console.log(`  \u25cf In Progress: ${inprogress}`);
  console.log(`  \u2716 Blocked:     ${blocked}`);
  console.log(`  \u25cb Deferred:    ${deferred}`);
  console.log(`  \u00b7 Not Started: ${notStarted}`);
  console.log(`  Overall:       ${Math.round((done / total) * 100)}%\n`);

  data.forEach(tier => {
    let d = 0, t = 0;
    tier.sections.forEach(s => s.items.forEach(i => { t++; if (i.done) d++; }));
    console.log(`  ${tier.icon} ${tier.id}: ${d}/${t} (${t ? Math.round((d / t) * 100) : 0}%)`);
  });

  // Write JSON artifact
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\nWrote ${JSON_PATH}`);

  // Patch HTML
  patchHTML(data);
  console.log(`Patched ${HTML_PATH}`);
  console.log('\nDone.');
}

main();
