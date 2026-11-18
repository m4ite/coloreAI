import { useState, useEffect, useCallback } from 'react';
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
import { SESSIONS, CHART_DATA } from '../data';
import { Badge } from '../components/ui';
import { api } from '../api';

/* ─── Data helpers ─── */
function useAdminData(path) {
  const [state, setState] = useState({ data: null, error: '', loading: true });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: '', loading: false });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, error: err.message, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [path, reloadKey]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, reload };
}

const fmtInt = (n) =>
  n === null || n === undefined ? '–' : Number(n).toLocaleString('pt-BR');

const fmtDec = (n, digits = 1) =>
  n === null || n === undefined
    ? '–'
    : Number(n).toLocaleString('pt-BR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });

// processing_time é gravado em milissegundos (premissa — ajustar se for segundos).
const msToSec = (ms) => (ms === null || ms === undefined ? null : ms / 1000);

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const weekdayLabel = (isoDay) => {
  const [y, m, d] = isoDay.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
};

function StateMessage({ loading, error, onRetry }) {
  if (loading) {
    return <p className="text-sm text-fg-muted py-6">Carregando…</p>;
  }
  if (error) {
    return (
      <div className="bg-error/8 border border-error/30 rounded-2xl p-5 flex items-center justify-between gap-4">
        <p className="text-sm text-error">{error}</p>
        <button
          onClick={onRetry}
          className="text-xs text-fg-muted hover:text-fg border border-border px-3 py-1.5 rounded-lg"
        >
          Tentar de novo
        </button>
      </div>
    );
  }
  return null;
}

function EmptyChart({ text }) {
  return (
    <div className="h-[180px] flex items-center justify-center text-sm text-fg-subtle border border-dashed border-border rounded-xl">
      {text}
    </div>
  );
}

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
  const { data, error, loading, reload } = useAdminData('/api/admin/stats');

  if (!data) {
    return <StateMessage loading={loading} error={error} onRetry={reload} />;
  }

  const { users, colorizations, quality } = data;
  const avgSec = msToSec(colorizations.avg_processing_time);
  const chartData = quality.last_7_days.map((d) => ({
    day: weekdayLabel(d.day),
    psnr: d.psnr === null ? null : Number(d.psnr.toFixed(2)),
    ssim: d.ssim === null ? null : Number(d.ssim.toFixed(3)),
  }));
  const hasChartData = quality.last_7_days.some((d) => d.count > 0);
  // Sem métricas reais ainda: mostra dados de exemplo, sinalizados na tela.
  // Some sozinho quando a primeira métrica for gravada.
  const isSample = !hasChartData;
  const qualityData = isSample ? CHART_DATA : chartData;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de usuários"
          value={fmtInt(users.total)}
          sub={`+${fmtInt(users.new_this_month)} este mês`}
          trend={users.new_this_month > 0 ? '+' : undefined}
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
          label="Imagens coloridas"
          value={fmtInt(colorizations.completed)}
          sub={`+${fmtInt(colorizations.today)} hoje`}
          trend={colorizations.today > 0 ? '+' : undefined}
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
          value={avgSec === null ? '–' : `${fmtDec(avgSec)}s`}
          sub={avgSec === null ? 'sem dados ainda' : 'por processamento'}
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
          value={fmtDec(quality.avg_psnr)}
          sub={quality.avg_psnr === null ? 'sem dados ainda' : 'dB'}
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
              {isSample
                ? 'Ilustrativo — os dados reais aparecem após as primeiras colorizações'
                : 'PSNR e SSIM — últimos 7 dias'}
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

        <div className={isSample ? 'opacity-60' : undefined}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={qualityData}
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
              domain={['auto', 'auto']}
              tick={{ fill: '#71717A', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              yAxisId="ssim"
              orientation="right"
              domain={['auto', 'auto']}
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
              connectNulls
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
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── Users tab ─── */
function UsersTab({ currentUser }) {
  const [search, setSearch] = useState('');
  const { data, error, loading, reload } = useAdminData('/api/admin/users');
  // Alterações confirmadas pelo servidor, aplicadas por cima da lista carregada.
  const [overrides, setOverrides] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  if (!data) {
    return <StateMessage loading={loading} error={error} onRetry={reload} />;
  }

  const users = data.users.map((u) =>
    overrides[u.id] ? { ...u, ...overrides[u.id] } : u
  );

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Só atualiza a linha depois que o servidor confirmar a mudança.
  const runAction = async (u, path, body, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusyId(u.id);
    setActionError('');
    try {
      const { user: updated } = await api(`/api/admin/users/${u.id}/${path}`, {
        method: 'PATCH',
        body,
      });
      setOverrides((o) => ({ ...o, [updated.id]: updated }));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = (u) =>
    runAction(
      u,
      'status',
      { active: !u.active },
      u.active ? `Desativar a conta de ${u.name}? A pessoa não conseguirá mais entrar.` : null
    );

  const toggleRole = (u) =>
    runAction(
      u,
      'role',
      { role: u.role === 'admin' ? 'user' : 'admin' },
      u.role === 'admin'
        ? `Remover o acesso de administrador de ${u.name}?`
        : `Tornar ${u.name} administrador? A pessoa terá acesso total ao painel.`
    );

  return (
    <div className="flex flex-col gap-4">
      {actionError && (
        <div className="bg-error/8 border border-error/30 rounded-xl px-4 py-3 text-sm text-error">
          {actionError}
        </div>
      )}

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
                  'Imagens Coloridas',
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-fg-subtle">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
              {filtered.map((u) => {
                const isSelf = u.id === currentUser?.id;
                const disabled = isSelf || busyId === u.id;
                return (
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
                        {isSelf && (
                          <span className="ml-1.5 text-xs text-fg-subtle font-normal">
                            (você)
                          </span>
                        )}
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
                          u.active ? 'bg-success' : 'bg-fg-subtle'
                        }`}
                      />

                      <Badge variant={u.active ? 'success' : 'error'}>
                        {u.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-sm text-fg-muted">
                    {fmtInt(u.colorizations)}
                  </td>

                  <td className="px-5 py-4 pr-6">
                    <div
                      className="flex gap-2"
                      title={isSelf ? 'Você não pode alterar a sua própria conta.' : undefined}
                    >
                      <button
                        onClick={() => toggleStatus(u)}
                        disabled={disabled}
                        className="text-xs text-fg-muted hover:text-fg border border-border hover:border-fg-subtle/50 px-2.5 py-1 rounded-lg transition-all hover:bg-muted-bg/30 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {u.active ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => toggleRole(u)}
                        disabled={disabled}
                        className="text-xs text-fg-muted hover:text-fg border border-border hover:border-fg-subtle/50 px-2.5 py-1 rounded-lg transition-all hover:bg-muted-bg/30 disabled:opacity-40 disabled:pointer-events-none"
                      >
                        {u.role === 'admin'
                          ? '→ Usuário'
                          : '→ Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Monitoring tab ─── */
function MonitoringTab() {
  const stats = useAdminData('/api/admin/stats');
  const log = useAdminData('/api/admin/colorizations?limit=20');

  if (!stats.data || !log.data) {
    const failed = stats.error ? stats : log;
    return (
      <StateMessage
        loading={stats.loading || log.loading}
        error={stats.error || log.error}
        onRetry={failed.reload}
      />
    );
  }

  const c = stats.data.colorizations;
  const errorRate =
    c.finished_24h > 0 ? (c.failed_24h / c.finished_24h) * 100 : null;
  const avgSec = msToSec(c.avg_processing_time);
  const timeData = stats.data.quality.last_7_days.map((d) => ({
    day: weekdayLabel(d.day),
    avg:
      d.avg_processing_time === null
        ? null
        : Number(msToSec(d.avg_processing_time).toFixed(2)),
  }));
  const hasTimeData = timeData.some((d) => d.avg !== null);
  const entries = log.data.colorizations;

  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Fila atual',
            value: fmtInt(c.processing),
            sub: 'imagens em processamento',
            color: 'text-info',
          },
          {
            label: 'Tempo médio',
            value: avgSec === null ? '–' : `${fmtDec(avgSec)}s`,
            sub: avgSec === null ? 'sem dados ainda' : 'por processamento',
            color: 'text-warning',
          },
          {
            label: 'Taxa de erro',
            value: errorRate === null ? '–' : `${fmtDec(errorRate)}%`,
            sub:
              errorRate === null
                ? 'nenhum processamento nas últimas 24h'
                : `últimas 24h (${fmtInt(c.failed_24h)} de ${fmtInt(c.finished_24h)})`,
            color:
              errorRate === null
                ? 'text-fg-muted'
                : errorRate > 5
                ? 'text-error'
                : 'text-success',
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
              Log de colorações
            </p>

            <p className="text-xs text-fg-muted mt-0.5">
              Últimas imagens processadas no sistema
            </p>
          </div>

          <button
            onClick={() => {
              stats.reload();
              log.reload();
            }}
            className="text-xs text-fg-muted hover:text-fg border border-border hover:border-fg-subtle/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Atualizar
          </button>
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
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-fg-subtle">
                    Nenhuma colorização registrada ainda.
                  </td>
                </tr>
              )}
              {entries.map((entry) => {
                const userName = entry.user_name || 'Usuário removido';
                const durationSec = msToSec(entry.processing_time);
                const created = new Date(entry.created_at);
                return (
                <tr
                  key={entry.id}
                  className="hover:bg-muted-bg/15 transition-colors"
                  title={entry.error_message || undefined}
                >
                  <td className="pl-6 pr-5 py-3.5 font-mono text-xs text-fg-subtle">
                    {entry.id.slice(0, 8)}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-accent-light">
                          {userName[0]}
                        </span>
                      </div>

                      <span className="text-fg text-sm">
                        {userName}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {created.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {durationSec === null ? '–' : `${fmtDec(durationSec)}s`}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {entry.psnr === null ? '–' : `${fmtDec(entry.psnr)} dB`}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
                    {entry.ssim === null ? '–' : fmtDec(entry.ssim, 2)}
                  </td>

                  <td className="px-5 py-3.5 pr-6">
                    <Badge
                      variant={
                        entry.status === 'completed'
                          ? 'success'
                          : entry.status === 'failed'
                          ? 'error'
                          : 'default'
                      }
                    >
                      {entry.status === 'completed'
                        ? 'Concluído'
                        : entry.status === 'failed'
                        ? 'Falhou'
                        : 'Processando'}
                    </Badge>
                  </td>
                </tr>
                );
              })}
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

        {!hasTimeData ? (
          <EmptyChart text="Nenhum processamento concluído nos últimos 7 dias." />
        ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart
            data={timeData}
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
              domain={['auto', 'auto']}
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
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
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
          {currentView === 'admin-users' && <UsersTab currentUser={user} />}
          {currentView === 'admin-monitoring' && <MonitoringTab />}
        </div>
      </main>
    </div>
  );
}