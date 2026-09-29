import HistoryItem from './HistoryItem';

const icons = {
  home: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M1.5 7L7.5 1.5 13.5 7v6.5h-4v-4h-4v4h-4V7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),

  history: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle
        cx="7.5"
        cy="7.5"
        r="6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M7.5 4.5V8l2.5 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  profile: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle
        cx="7.5"
        cy="5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2 13c0-3.04 2.462-5.5 5.5-5.5S13 9.96 13 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),

  chart: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect
        x="1.5"
        y="9"
        width="3"
        height="4.5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="6"
        y="5.5"
        width="3"
        height="8"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="10.5"
        y="2"
        width="3"
        height="11.5"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  ),

  users: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle
        cx="5.5"
        cy="5"
        r="2"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M1 13c0-2.485 2.015-4.5 4.5-4.5S10 10.515 10 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle
        cx="10.5"
        cy="5"
        r="1.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M12 8.7c1.44.48 2.5 1.84 2.5 3.3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  ),

  activity: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M1 7.5h2.5L5 3.5 7.5 11 10 5.5l1.5 2.5H14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  logout: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 7h7M9 4l3 3-3 3M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left ${
        active
          ? 'bg-accent/12 text-accent-light font-medium'
          : 'text-fg-muted hover:text-fg hover:bg-muted-bg/50'
      }`}
    >
      <span
        className={`shrink-0 ${
          active ? 'text-accent-light' : 'text-fg-subtle'
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function SectionLabel({ label }) {
  return (
    <p className="px-3 py-1.5 text-[10px] text-fg-subtle uppercase tracking-[0.08em] font-semibold">
      {label}
    </p>
  );
}

export default function Sidebar({
  user,
  sessions,
  currentView,
  navigate,
  onSelectSession,
  onNewColorization,
  onLogout,
}) {
  const isAdmin = user.role === 'admin';

  return (
    <aside className="w-[248px] shrink-0 bg-panel border-r border-border flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shadow-sm shadow-accent/30">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle
              cx="7"
              cy="7"
              r="5.5"
              stroke="white"
              strokeWidth="1.4"
            />
            <path
              d="M5 7c0-1.1.9-2 2-2s2 .9 2 2"
              stroke="white"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M7 5V3M5.5 5.75L4.2 4.45M8.5 5.75L9.8 4.45"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <span className="font-semibold text-fg tracking-tight">
          ColoreAI
        </span>
      </div>

      {/* New colorization CTA */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <button
          onClick={onNewColorization}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 active:bg-accent/80 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-colors shadow-sm shadow-accent/20"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2v10M2 7h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Colorir nova imagem
        </button>
      </div>

      {/* Main nav */}
      <div className="px-2 pt-3 pb-1 shrink-0">
        <SectionLabel label="Menu" />

        <div className="flex flex-col gap-0.5 mt-0.5">
          <NavItem
            label="Início"
            icon={icons.home}
            active={currentView === 'home'}
            onClick={() => navigate('home')}
          />

          <NavItem
            label="Histórico"
            icon={icons.history}
            active={currentView === 'history'}
            onClick={() => navigate('history')}
          />

          <NavItem
            label="Editar perfil"
            icon={icons.profile}
            active={currentView === 'edit-profile'}
            onClick={() => navigate('edit-profile')}
          />
        </div>
      </div>

      {/* Admin nav */}
      {isAdmin && (
        <div className="px-2 pt-3 pb-1 shrink-0">
          <SectionLabel label="Administrador" />

          <div className="flex flex-col gap-0.5 mt-0.5">
            <NavItem
              label="Visão geral"
              icon={icons.chart}
              active={currentView === 'admin-overview'}
              onClick={() => navigate('admin-overview')}
            />

            <NavItem
              label="Usuários"
              icon={icons.users}
              active={currentView === 'admin-users'}
              onClick={() => navigate('admin-users')}
            />

            <NavItem
              label="Monitoramento"
              icon={icons.activity}
              active={currentView === 'admin-monitoring'}
              onClick={() => navigate('admin-monitoring')}
            />
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pt-3">
        <SectionLabel label="Recentes" />

        <div className="flex flex-col gap-0.5 mt-0.5">
          {sessions.slice(0, 8).map((s) => (
            <HistoryItem
              key={s.id}
              session={s}
              compact
              onClick={() => onSelectSession(s)}
            />
          ))}

          {sessions.length === 0 && (
            <p className="px-3 py-3 text-xs text-fg-subtle">
              Nenhuma imagem colorida ainda.
            </p>
          )}
        </div>
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-border shrink-0">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-accent-light">
              {user.name[0]}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-fg-subtle truncate">
              {user.email}
            </p>
          </div>

          <button
            onClick={onLogout}
            title="Sair da conta"
            className="text-fg-subtle hover:text-error transition-colors shrink-0 p-1.5 rounded-lg hover:bg-error/8"
          >
            {icons.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}