import React from 'react';
import '../styles/BloqueVideo.css';

function toYouTubeEmbed(urlOrId: string): string {
  // Casos: ID directo, watch?v=, youtu.be/, shorts/
  // Si trae espacios o parámetros extra, limpiamos.
  const trimmed = urlOrId.trim();

  // Si parece un ID directo
  const idRegex = /^[a-zA-Z0-9_-]{11}$/;
  if (idRegex.test(trimmed)) {
    return `https://www.youtube.com/embed/${trimmed}`;
  }

  try {
    const u = new URL(trimmed);

    if (u.hostname.includes('youtube.com')) {
      // watch?v=ID
      const v = u.searchParams.get('v');
      if (v && idRegex.test(v)) return `https://www.youtube.com/embed/${v}`;

      // shorts/ID
      const shortsMatch = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

      // embed/ID (ya embebido)
      const embedMatch = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }

    if (u.hostname === 'youtu.be') {
      const pathId = u.pathname.replace('/', '');
      if (idRegex.test(pathId)) return `https://www.youtube.com/embed/${pathId}`;
    }
  } catch {
    // Si no es URL válida, caemos a intentar como ID
    if (idRegex.test(trimmed)) return `https://www.youtube.com/embed/${trimmed}`;
  }

  // Último recurso: pasar la URL tal cual a embed (YouTube suele ignorar)
  return `https://www.youtube.com/embed/${encodeURIComponent(trimmed)}`;
}

export default function BloqueVideo({ urlOrId, title }: { urlOrId: string; title?: string }) {
  const src = toYouTubeEmbed(urlOrId);
  return (
    <div className="video-wrapper">
      {title ? <h3 className="video-title">{title}</h3> : null}
      <div className="video-embed">
        <iframe
          className="video-iframe"
          src={`${src}?rel=0`}
          title={title ?? 'YouTube video player'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
