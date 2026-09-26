import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Sidebar from '../components/Sidebar';
import {
  SESSIONS,
  CHART_DATA,
  ADMIN_USERS,
  MONITORING_LOG,
} from '../data';
import { Badge } from '../components/ui';

/* ─── Shared stat card ─── */
function StatCard({ label, value, sub, trend, icon }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-border/60 transition-colors">
      <div className="flex items-start justify-between">
        <p className="text-xs text-fg-subtle uppercase tracking-widest font-semibold">
          {label}
        </p>

        <div className="w-8 h-8 rounded-xl bg-muted-bg flex items-center justify-center text-fg-muted">
          {icon}
        </div>
      </div>

      <div>
        <p className="text-3xl font-semibold text-fg font-mono leading-none">
          {value}
        </p>

        {sub && (
          <p
            className={`text-xs mt-1.5 flex items-center gap-1 ${
              trend === '+'
                ? 'text-success'
                : trend === '-'
                ? 'text-error'
                : 'text-fg-muted'
            }`}
          >
            {trend === '+' && '↑'}
            {trend === '-' && '↓'}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

const tooltipStyle = {
  contentStyle: {
    background: '#18181B',
    border: '1px solid #27272A',
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: {
    color: '#A1A1AA',
    marginBottom: 4,
  },
  itemStyle: {
    color: '#F4F4F5',
  },
};

/* ─── Overview tab ─── */
function OverviewTab() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de usuários"
          value="1.247"
          sub="+23 este mês"
          trend="+"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="6"
                cy="5.5"
                r="2.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M1 14c0-2.76 2.239-5 5-5s5 2.24 5 5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle
                cx="11.5"
                cy="5.5"
                r="2"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M13 9.5c1.66.45 3 1.97 3 3.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        <StatCard
          label="Colorizações"
          value="28.493"
          sub="+341 hoje"
          trend="+"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M5.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <path
                d="M8 5.5V3.5M6.3 6.3L4.9 4.9M9.7 6.3L11.1 4.9"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          }
        />

        <StatCard
          label="Tempo médio"
          value="3,2s"
          sub="por processamento"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="8"
                cy="8"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.3"
              />
              <path
                d="M8 5v3.5l2.5 2"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />

        <StatCard
          label="PSNR médio"
          value="31,8"
          sub="dB — qualidade boa"
          trend="+"
          icon={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1 12l4-5 3 3 3-8 4 5.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      {/* Quality chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-fg">
              Métricas de qualidade
            </p>
            <p className="text-xs text-fg-muted mt-0.5">
              PSNR e SSIM — últimos 7 dias
            </p>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 text-xs text-fg-muted border border-border hover:border-fg-subtle/50 hover:text-fg px-3 py-1.5 rounded-lg transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 10V7l2-2 2.5 2.5 3-5 2.5 3V10H2z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              Exportar PDF
            </button>

            <button className="flex items-center gap-1.5 text-xs text-fg-muted border border-border hover:border-fg-subtle/50 hover:text-fg px-3 py-1.5 rounded-lg transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 3h8M2 6h8M2 9h5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={CHART_DATA}
            margin={{ top: 4, right: 20, left: -12, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272A"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: '#71717A', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="psnr"
              domain={[26, 37]}
              tick={{ fill: '#71717A', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="ssim"
              orientation="right"
              domain={[0.75, 0.95]}
              tick={{ fill: '#71717A', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(2)}
            />

            <Tooltip {...tooltipStyle} />

            <Legend
              wrapperStyle={{
                fontSize: 12,
                color: '#A1A1AA',
                paddingTop: 12,
              }}
            />

            <Line
              yAxisId="psnr"
              type="monotone"
              dataKey="psnr"
              name="PSNR (dB)"
              stroke="#7C3AED"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: '#7C3AED',
                stroke: '#4C1D95',
                strokeWidth: 2,
              }}
            />

            <Line
              yAxisId="ssim"
              type="monotone"
              dataKey="ssim"
              name="SSIM"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: '#22C55E',
                stroke: '#14532D',
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Users tab ─── */
function UsersTab() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(ADMIN_USERS);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) =>
    setUsers((us) =>
      us.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === 'active' ? 'inactive' : 'active',
            }
          : u
      )
    );

  const toggleRole = (id) =>
    setUsers((us) =>
      us.map((u) =>
        u.id === id
          ? {
              ...u,
              role: u.role === 'admin' ? 'user' : 'admin',
            }
          : u
      )
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle"
          >
            <circle
              cx="6"
              cy="6"
              r="4.5"
              stroke="currentColor"
              strokeWidth="1.4"
            />
            <path
              d="M9.5 9.5L13 13"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>

          <input
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle outline-none focus:border-accent/60 transition-colors"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-fg-subtle">
            {filtered.length} de {users.length} usuários
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  'Usuário',
                  'E-mail',
                  'Papel',
                  'Status',
                  'Colorizações',
                  'Ações',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] text-fg-subtle font-semibold uppercase tracking-widest px-5 py-3.5 first:pl-6 last:pr-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-muted-bg/20 transition-colors"
                >
                  <td className="pl-6 pr-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent-light">
                          {u.name[0]}
                        </span>
                      </div>

                      <span className="font-medium text-fg">
                        {u.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-fg-muted">
                    {u.email}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      variant={u.role === 'admin' ? 'accent' : 'default'}
                    >
                      {u.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.status === 'active'
                            ? 'bg-success'
                            : 'bg-fg-subtle'
                        }`}
                      />

                      <Badge
                        variant={
                          u.status === 'active' ? 'success' : 'error'
                        }
                      >
                        {u.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-sm text-fg-muted">
                    {u.count}
                  </td>

                  <td className="px-5 py-4 pr-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className="text-xs text-fg-muted hover:text-fg border border-border hover:border-fg-subtle/50 px-2.5 py-1 rounded-lg transition-all hover:bg-muted-bg/30"
                      >
                        {u.status === 'active'
                          ? 'Desativar'
                          : 'Ativar'}
                      </button>

                      <button
                        onClick={() => toggleRole(u.id)}
                        className="text-xs text-fg-muted hover:text-fg border border-border hover:border-fg-subtle/50 px-2.5 py-1 rounded-lg transition-all hover:bg-muted-bg/30"
                      >
                        {u.role === 'admin'
                          ? '→ Usuário'
                          : '→ Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Monitoring tab ─── */
function MonitoringTab() {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Fila atual',
            value: '3',
            sub: 'imagens em espera',
            color: 'text-info',
          },
          {
            label: 'Uso de GPU',
            value: '74%',
            sub: 'A100 — operação normal',
            color: 'text-warning',
          },
          {
            label: 'Taxa de erro',
            value: '1,2%',
            sub: 'últimas 24h',
            color: 'text-success',
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <p className="text-[11px] text-fg-subtle uppercase tracking-widest font-semibold mb-3">
              {k.label}
            </p>

            <p
              className={`text-3xl font-semibold font-mono ${k.color}`}
            >
              {k.value}
            </p>

            <p className="text-xs text-fg-muted mt-1.5">
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-fg">
              Log de colorizações
            </p>

            <p className="text-xs text-fg-muted mt-0.5">
              Últimas colorizações processadas no sistema
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-fg-muted font-medium">
              Ao vivo
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  'ID',
                  'Usuário',
                  'Hora',
                  'Duração',
                  'PSNR',
                  'SSIM',
                  'Status',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] text-fg-subtle font-semibold uppercase tracking-widest px-5 py-3 first:pl-6 last:pr-6"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {MONITORING_LOG.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-muted-bg/15 transition-colors"
                >
                  <td className="pl-6 pr-5 py-3.5 font-mono text-xs text-fg-subtle">
                    {entry.id}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-accent-light">
                          {entry.user[0]}
                        </span>
                      </div>

                      <span className="text-fg text-sm">
                        {entry.user}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {entry.time}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {entry.duration}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {entry.psnr ? `${entry.psnr} dB` : '–'}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {entry.ssim ? entry.ssim.toFixed(2) : '–'}
                  </td>

                  <td className="px-5 py-3.5 pr-6">
                    <Badge
                      variant={
                        entry.status === 'done'
                          ? 'success'
                          : 'error'
                      }
                    >
                      {entry.status === 'done'
                        ? 'Concluído'
                        : 'Falhou'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing time chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold text-fg">
            Tempo de processamento médio
          </p>

          <p className="text-xs text-fg-muted mt-0.5">
            Por dia — últimos 7 dias (segundos)
          </p>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={[
              { day: 'Seg', avg: 3.8 },
              { day: 'Ter', avg: 3.5 },
              { day: 'Qua', avg: 3.1 },
              { day: 'Qui', avg: 3.3 },
              { day: 'Sex', avg: 2.9 },
              { day: 'Sáb', avg: 3.2 },
              { day: 'Dom', avg: 3.0 },
            ]}
            margin={{ top: 4, right: 16, left: -12, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="gradTime"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#7C3AED"
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor="#7C3AED"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272A"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: '#71717A', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[2, 5]}
              tick={{ fill: '#71717A', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              {...tooltipStyle}
              formatter={(v) => [`${v}s`, 'Tempo médio']}
            />

            <Area
              type="monotone"
              dataKey="avg"
              stroke="#7C3AED"
              strokeWidth={2.5}
              fill="url(#gradTime)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#7C3AED',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Admin nav tabs ─── */
const ADMIN_TABS = [
  {
    view: 'admin-overview',
    label: 'Visão geral',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M1 10l3-4 2.5 2.5 2.5-5.5L12 8.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    view: 'admin-users',
    label: 'Usuários',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <circle
          cx="5"
          cy="4.5"
          r="2"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M1 11c0-2.21 1.79-4 4-4s4 1.79 4 4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle
          cx="10"
          cy="4.5"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M11 7.5c.95.3 2 1.25 2 2.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    view: 'admin-monitoring',
    label: 'Monitoramento',
    icon: (
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M1 6.5h2l1.5-3.5 2 7 1.5-5 1.5 3.5H13"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function AdminPage({
  user,
  currentView,
  navigate,
  onSelectSession,
  onNewColorization,
  onLogout,
}) {
  const tabLabels = {
    'admin-overview': 'Visão geral',
    'admin-users': 'Gerenciar usuários',
    'admin-monitoring': 'Monitoramento',
    login: '',
    register: '',
    'forgot-email': '',
    'forgot-newpass': '',
    'edit-profile': '',
    home: '',
    result: '',
    history: '',
  };

  return (
    <div className="flex h-full bg-bg overflow-hidden">
      <Sidebar
        user={user}
        sessions={SESSIONS}
        currentView={currentView}
        navigate={navigate}
        onSelectSession={onSelectSession}
        onNewColorization={onNewColorization}
        onLogout={onLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold text-accent-light bg-accent/10 px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                  Administrador
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-fg tracking-tight">
                {tabLabels[currentView] || 'Painel'}
              </h1>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-surface border border-border rounded-2xl w-fit mb-7">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.view}
                onClick={() => navigate(tab.view)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentView === tab.view
                    ? 'bg-card text-fg shadow-sm'
                    : 'text-fg-subtle hover:text-fg-muted'
                }`}
              >
                <span
                  className={
                    currentView === tab.view
                      ? 'text-accent-light'
                      : 'text-fg-subtle'
                  }
                >
                  {tab.icon}
                </span>

                {tab.label}
              </button>
            ))}
          </div>

          {currentView === 'admin-overview' && <OverviewTab />}
          {currentView === 'admin-users' && <UsersTab />}
          {currentView === 'admin-monitoring' && <MonitoringTab />}
        </div>
      </main>
    </div>
  );
}