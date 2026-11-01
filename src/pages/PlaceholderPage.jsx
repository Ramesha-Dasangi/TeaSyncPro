import React from 'react';
import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title, description }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(16,185,129,0.1)', border: '2px dashed var(--card-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: 'var(--emerald-500)'
        }}>
          <Construction size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--slate-200)', marginBottom: '8px' }}>{title}</h2>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', maxWidth: '360px' }}>
          {description || 'This section is currently being updated for this estate.'}
        </p>
        <div style={{
          marginTop: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16,185,129,0.07)', border: '1px solid var(--card-border)',
          borderRadius: '20px', padding: '8px 20px', fontSize: '0.78rem', color: 'var(--emerald-400)'
        }}>
          Section under maintenance
        </div>
      </div>
    </div>
  );
}
