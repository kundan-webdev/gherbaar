import React from 'react';
import { FileText } from 'lucide-react';

export function PhotoGallery({ photos }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
      {photos.map((src) => {
        const isPdf = src.toLowerCase().endsWith('.pdf');
        return (
          <a key={src} href={src} target="_blank" rel="noreferrer">
            {isPdf ? (
              <div
                style={{
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface-alt)',
                  color: 'var(--color-accent)',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <FileText size={22} />
                PDF
              </div>
            ) : (
              <img
                src={src}
                alt="Attachment"
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              />
            )}
          </a>
        );
      })}
    </div>
  );
}
