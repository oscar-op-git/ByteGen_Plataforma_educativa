import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../styles/BloqueDiapositivas.css';

interface TranscriptItem {
  start: number; // segundos
  end: number;   // segundos
  text: string;
}

interface PdfPayload {
  pdfUrl: string;        
  totalPages?: number;   
  audioUrl?: string;
  transcript?: TranscriptItem[];
  startPage?: number;    
}

interface Props {
  content: string; // JSON con PdfPayload
}

function buildPdfSrc(pdfUrl: string, page: number) {
  return `${pdfUrl}#page=${page}&zoom=page-width`;
}

export default function BloquePDF({ content }: Props) {
  const payload: PdfPayload = useMemo(() => {
    try { return JSON.parse(content); } catch { return { pdfUrl: '' }; }
  }, [content]);

  const [page, setPage] = useState<number>(payload.startPage || 1);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const transcript = payload.transcript ?? [];
  const totalPages = payload.totalPages ?? 1;
  const hasAudio = !!payload.audioUrl;

  const currentTranscriptIdx = useMemo(() => {
    if (!transcript.length) return -1;
    return transcript.findIndex(t => currentTime >= t.start && currentTime < t.end);
  }, [currentTime, transcript]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    a.addEventListener('timeupdate', onTime);
    return () => a.removeEventListener('timeupdate', onTime);
  }, []);

  const seekTo = (s: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = s;
      audioRef.current.play().catch(() => {});
    }
  };

  const goPrev = () => setPage(p => Math.max(1, p - 1));
  const goNext = () => setPage(p => Math.min(totalPages, p + 1));
  const jumpTo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  const src = useMemo(() => buildPdfSrc(payload.pdfUrl, page), [payload.pdfUrl, page]);

  return (
    <div className="pdf-block">
      <div className="pdf-header">
        <div className="pdf-counter">Página {page}{totalPages ? ` / ${totalPages}` : ''}</div>
        <div className="pdf-nav">
          <button onClick={goPrev} disabled={page <= 1} aria-label="Página anterior">◀</button>
          <button onClick={goNext} disabled={totalPages ? page >= totalPages : false} aria-label="Página siguiente">▶</button>
          <label className="pdf-jump">
            Ir a:
            <input
              type="number"
              min={1}
              max={totalPages || undefined}
              value={page}
              onChange={(e) => jumpTo(Number(e.target.value) || 1)}
            />
          </label>
        </div>
      </div>

      <div className="pdf-body">
        <div className="pdf-viewer">
          {payload.pdfUrl ? (
            <iframe
              ref={iframeRef}
              title="Visor PDF"
              className="pdf-iframe"
              src={src}
            />
          ) : (
            <div className="pdf-empty">Agrega un <code>pdfUrl</code> en el contenido.</div>
          )}
        </div>

        <aside className="pdf-aside">
          <div className="pdf-audio">
            {hasAudio ? (
              <audio ref={audioRef} src={payload.audioUrl} controls preload="metadata" />
            ) : (
              <div className="audio-placeholder">
                Añade un <code>audioUrl</code> para habilitar audio.
              </div>
            )}
          </div>

          <div className="pdf-transcript">
            <h4>Transcripción</h4>
            {!transcript.length ? (
              <p className="transcript-empty">No hay transcripción disponible.</p>
            ) : (
              <ol className="transcript-list">
                {transcript.map((t, i) => (
                  <li key={i}>
                    <button
                      className={i === currentTranscriptIdx ? 'transcript-line active' : 'transcript-line'}
                      onClick={() => seekTo(t.start)}
                      aria-label={`Reproducir desde ${Math.floor(t.start)} segundos`}
                    >
                      <span className="time">[{Math.floor(t.start)}s]</span>
                      <span className="text">{t.text}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
