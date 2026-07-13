import React from 'react';

export function PhotoGallery({ photos }) {
  if (!photos || photos.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
      {photos.map((src) => (
        <a key={src} href={src} target="_blank" rel="noreferrer">
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
        </a>
      ))}
    </div>
  );
}
