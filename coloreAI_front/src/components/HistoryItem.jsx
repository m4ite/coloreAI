import { Badge } from './ui';

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

export default function HistoryItem({
  session,
  compact = false,
  onClick,
  onDelete,
}) {
  const imgBase = `https://images.unsplash.com/photo-${session.imageId}`;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted-bg/60 transition-colors text-left group"
      >
        <div className="relative shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted-bg">
          <img
            src={`${imgBase}?w=80&h=80&fit=crop&auto=format`}
            alt={session.subject}
            className={`w-full h-full object-cover ${
              session.status === 'failed' ? 'opacity-40' : ''
            }`}
            style={{ filter: 'grayscale(1)' }}
          />

          {session.status === 'failed' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-error">✕</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-fg truncate">{session.subject}</p>
          <p className="text-xs text-fg-subtle">
            {formatDate(session.date)}
          </p>
        </div>

        {session.status === 'failed' && (
          <Badge variant="error">Erro</Badge>
        )}
      </button>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted-bg">
        <img
          src={`${imgBase}?w=400&h=225&fit=crop&auto=format`}
          alt={session.subject}
          className={`w-full h-full object-cover transition-transform group-hover:scale-105 duration-300 ${
            session.status === 'failed' ? 'opacity-40' : ''
          }`}
          style={{ filter: 'grayscale(1)' }}
        />

        <div className="absolute top-2 left-2">
          {session.status === 'done' ? (
            <Badge variant="success">Concluído</Badge>
          ) : (
            <Badge variant="error">Erro</Badge>
          )}
        </div>

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-fg">{session.subject}</p>

        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-fg-subtle">
            {formatDate(session.date)}
          </p>

          {session.psnr && (
            <p className="text-xs font-mono text-fg-subtle">
              PSNR {session.psnr} dB
            </p>
          )}
        </div>
      </div>
    </div>
  );
}