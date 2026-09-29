import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import HistoryItem from '../components/HistoryItem';
import { Modal, Button, Badge } from '../components/ui';

const FILTER_LABELS = {
  all: 'Todas',
  done: 'Concluídas',
  failed: 'Com erro',
};

export default function HistoryPage({
  user,
  sessions: initSessions,
  currentView,
  navigate,
  onSelectSession,
  onNewColorization,
  onLogout,
}) {
  const [sessions, setSessions] = useState(initSessions);
  const [toDelete, setToDelete] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? sessions
      : sessions.filter((s) => s.status === filter);

  const confirmDelete = () => {
    if (toDelete) {
      setSessions((s) =>
        s.filter((item) => item.id !== toDelete.id)
      );

      setToDelete(null);
    }
  };

  const counts = {
    all: sessions.length,
    done: sessions.filter((s) => s.status === 'done').length,
    failed: sessions.filter((s) => s.status === 'failed').length,
  };

  return (
    <div className="flex h-full bg-bg overflow-hidden">
      <Sidebar
        user={user}
        sessions={sessions}
        currentView={currentView}
        navigate={navigate}
        onSelectSession={onSelectSession}
        onNewColorization={onNewColorization}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-fg tracking-tight">
                Histórico
              </h1>

              <p className="text-fg-muted mt-1">
                {sessions.length} 
                {sessions.length !== 1 ? ' imagens' : ' imagem'} no total
              </p>
            </div>

            <button
              onClick={onNewColorization}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-accent/20"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
              >
                <path
                  d="M6.5 2v9M2 6.5h9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              Colorir nova imagem
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl w-fit mb-6">
            {Object.keys(FILTER_LABELS).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-card text-fg shadow-sm'
                    : 'text-fg-subtle hover:text-fg-muted'
                }`}
              >
                {FILTER_LABELS[f]}

                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    filter === f
                      ? 'bg-muted-bg text-fg-muted'
                      : 'text-fg-subtle'
                  }`}
                >
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted-bg flex items-center justify-center mb-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  className="text-fg-subtle"
                >
                  <circle
                    cx="14"
                    cy="14"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M14 10v5l3 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="text-fg font-medium">
                {filter === 'all'
                  ? 'Nenhuma coloração ainda'
                  : `Nenhuma coloração ${
                      filter === 'done'
                        ? 'concluída'
                        : 'com erro'
                    }`}
              </p>

              <p className="text-fg-muted text-sm mt-1">
                {filter === 'all'
                  ? 'Envie uma foto para começar.'
                  : 'Mude o filtro ou envie uma nova foto.'}
              </p>

              {filter === 'all' && (
                <button
                  onClick={onNewColorization}
                  className="mt-5 bg-accent hover:bg-accent/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  Colorir nova imagem
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((s) => (
                <HistoryItem
                  key={s.id}
                  session={s}
                  onClick={() => onSelectSession(s)}
                  onDelete={() => setToDelete(s)}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Delete confirmation modal */}
      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir"
      >
        <p className="text-sm text-fg-muted mb-6 leading-relaxed">
          Tem certeza que deseja excluir{' '}
          <strong className="text-fg font-semibold">
            "{toDelete?.subject}"
          </strong>
          ? Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setToDelete(null)}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            className="flex-1"
            onClick={confirmDelete}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}