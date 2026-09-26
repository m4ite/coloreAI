const TABS = [
  { view: 'home', label: 'Início', icon: '🏠' },
  { view: 'history', label: 'Histórico', icon: '🕐' },
  { view: 'edit-profile', label: 'Perfil', icon: '👤' },
];

export default function BottomNav({ currentView, navigate }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-panel border-t border-border flex z-40">
      {TABS.map((tab) => {
        const active = currentView === tab.view;

        return (
          <button
            key={tab.view}
            onClick={() => navigate(tab.view)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors ${
              active ? 'text-accent-light' : 'text-fg-subtle hover:text-fg-muted'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}