/**
 * Fractional indexing for efficient list ordering.
 * Generates string keys that sort lexicographically, allowing
 * insertion between any two existing keys without reindexing.
 */

const BASE = 'abcdefghijklmnopqrstuvwxyz';
const MID = 'm'; // middle character

/**
 * Generate a position string between two existing positions.
 * If `before` is null/undefined, generates a position before `after`.
 * If `after` is null/undefined, generates a position after `before`.
 * If both are null/undefined, generates a middle position.
 */
export function generateKeyBetween(
  before: string | null | undefined,
  after: string | null | undefined
): string {
  if (!before && !after) {
    return MID;
  }

  if (!before) {
    // Generate a key before `after`
    return decrementKey(after!);
  }

  if (!after) {
    // Generate a key after `before`
    return incrementKey(before);
  }

  // Generate a key between `before` and `after`
  return midpoint(before, after);
}

function midpoint(a: string, b: string): string {
  // Pad to same length
  const maxLen = Math.max(a.length, b.length);
  const aPad = a.padEnd(maxLen, BASE[0]);
  const bPad = b.padEnd(maxLen, BASE[0]);

  // Find midpoint character by character
  let result = '';
  for (let i = 0; i < maxLen; i++) {
    const aIdx = BASE.indexOf(aPad[i]);
    const bIdx = BASE.indexOf(bPad[i]);

    if (aIdx === bIdx) {
      result += BASE[aIdx];
      continue;
    }

    const midIdx = Math.floor((aIdx + bIdx) / 2);
    if (midIdx > aIdx) {
      result += BASE[midIdx];
      return result;
    }

    // Need to go deeper
    result += BASE[aIdx];
    // Append middle of remaining range
    result += MID;
    return result;
  }

  // If we get here, strings are equal - append middle char
  return result + MID;
}

function incrementKey(key: string): string {
  const chars = key.split('');
  for (let i = chars.length - 1; i >= 0; i--) {
    const idx = BASE.indexOf(chars[i]);
    if (idx < BASE.length - 1) {
      chars[i] = BASE[idx + 1];
      return chars.join('');
    }
    chars[i] = BASE[0]; // carry
  }
  return key + MID; // overflow: append
}

function decrementKey(key: string): string {
  const chars = key.split('');
  for (let i = chars.length - 1; i >= 0; i--) {
    const idx = BASE.indexOf(chars[i]);
    if (idx > 0) {
      chars[i] = BASE[idx - 1];
      return chars.join('');
    }
    chars[i] = BASE[BASE.length - 1]; // borrow
  }
  return BASE[0] + key; // underflow: prepend
}

/**
 * Generate initial positions for a list of items.
 * Returns an array of position strings evenly spaced.
 */
export function generateNPositions(count: number): string[] {
  if (count === 0) return [];
  if (count === 1) return [MID];

  const positions: string[] = [];
  const step = Math.floor(BASE.length / (count + 1));

  for (let i = 1; i <= count; i++) {
    const idx = Math.min(step * i, BASE.length - 1);
    positions.push(BASE[idx]);
  }

  return positions;
}
