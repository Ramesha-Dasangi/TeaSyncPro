import React, { useMemo } from 'react';

// Deterministic QR-style traceability matrix SVG (zero external deps)
export default function LotQRCode({ value = 'TEASYNCPRO', size = 104 }) {
  const { modules, hash } = useMemo(() => {
    const n = 21;
    const grid = Array.from({ length: n }, () => Array(n).fill(false));

    const drawFinder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const border = r === 0 || r === 6 || c === 0 || c === 6;
          const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[r0 + r][c0 + c] = border || center;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, n - 7);
    drawFinder(n - 7, 0);

    // Deterministic FNV-1a hash seed from value
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const hexHash = (h >>> 0).toString(16).padStart(8, '0');

    let state = (h >>> 0) || 1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const inFinder =
          (r < 8 && c < 8) ||
          (r < 8 && c >= n - 8) ||
          (r >= n - 8 && c < 8);
        if (inFinder) continue;
        if (r === 6 || c === 6) {
          grid[r][c] = (r + c) % 2 === 0;
          continue;
        }
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        grid[r][c] = (state & 1) === 1;
      }
    }
    return { modules: grid, hash: hexHash };
  }, [value]);

  const n = modules.length;
  const cell = size / n;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ background: '#ffffff', padding: 6, borderRadius: 8, border: '1px solid #cbd5e1' }}
        aria-label={`QR Traceability Code for ${value}`}
      >
        {modules.map((row, r) =>
          row.map((on, c) =>
            on ? (
              <rect
                key={`${r}-${c}`}
                x={c * cell}
                y={r * cell}
                width={cell + 0.15}
                height={cell + 0.15}
                fill="#0f172a"
              />
            ) : null
          )
        )}
      </svg>
      <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
        TRACE-HASH: {hash}
      </span>
    </div>
  );
}
