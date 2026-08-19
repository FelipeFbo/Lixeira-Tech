import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../lib/api";
import { calculateAggregateImpact, calculateImpact } from "../lib/impact";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import "./Admin.css";

const TABS = [
  { key: "overview", label: "Visão geral" },
  { key: "deposits", label: "Depósitos" },
  { key: "pending", label: "Aprovações" },
  { key: "bins", label: "Lixeiras" },
  { key: "students", label: "Usuários" },
  { key: "classes", label: "Ranking geral" },
];

const DASHBOARD_PERIODS = [
  { key: "all", label: "Todo o período" },
  { key: "30", label: "Últimos 30 dias" },
  { key: "7", label: "Últimos 7 dias" },
];

function statusLabel(status) {
  return ({ pending: "Em análise", approved: "Aprovado", rejected: "Rejeitado" })[status] || status;
}

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [globalStats, setGlobalStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [bins, setBins] = useState([]);
  const [students, setStudents] = useState([]);
  const [classRankings, setClassRankings] = useState([]);
  const [pointsDraft, setPointsDraft] = useState({});
  const [addPointsDraft, setAddPointsDraft] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [dashboardPeriod, setDashboardPeriod] = useState("all");
  const [dashboardCategory, setDashboardCategory] = useState(null);
  const [dashboardMetric, setDashboardMetric] = useState("co2Kg");
  const [binForm, setBinForm] = useState({ name: "", location: "" });

  function loadAll() {
    api.admin.globalStats().then(setGlobalStats).catch(() => {});
    api.admin.pendingDeposits().then(setPending).catch(() => {});
    api.admin.depositsHistory().then(setDeposits).catch(() => {});
    api.admin.bins().then(setBins).catch(() => {});
    api.admin.users().then(setStudents).catch(() => {});
    api.admin.userRankings().then(setClassRankings).catch(() => {});
  }

  useEffect(loadAll, []);

  async function approve(deposit) {
    const points = Number(pointsDraft[deposit.id] ?? Math.round((deposit.weight || 0) * 10));
    setBusyId(deposit.id);
    try {
      await api.admin.approveDeposit(deposit.id, points);
      setPending((prev) => prev.filter((d) => d.id !== deposit.id));
      loadAll();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(deposit) {
    setBusyId(deposit.id);
    try {
      await api.admin.rejectDeposit(deposit.id);
      setPending((prev) => prev.filter((d) => d.id !== deposit.id));
      loadAll();
    } finally {
      setBusyId(null);
    }
  }

  async function addManualPoints(studentId) {
    const points = Number(addPointsDraft[studentId] || 0);
    if (!points) return;
    await api.admin.addPoints(studentId, points, "Pontos manuais (admin)");
    setAddPointsDraft((prev) => ({ ...prev, [studentId]: "" }));
    api.admin.users().then(setStudents).catch(() => {});
  }

  async function collectBin(binId) {
    await api.admin.collectBin(binId);
    loadAll();
  }

  async function changeBinStatus(binId, status) {
    await api.admin.updateBin(binId, { status });
    loadAll();
  }

  async function createBin(event) {
    event.preventDefault();
    if (!binForm.name.trim() || !binForm.location.trim()) return;
    await api.admin.createBin(binForm.name, binForm.location);
    setBinForm({ name: "", location: "" });
    loadAll();
  }

  const periodStart = dashboardPeriod === "all"
    ? null
    : new Date(Date.now() - Number(dashboardPeriod) * 24 * 60 * 60 * 1000);
  const periodDeposits = deposits.filter((d) => !periodStart || new Date(d.date) >= periodStart);
  const approvedInPeriod = periodDeposits.filter((d) => d.status === "approved");
  const categoryData = Object.values(
    approvedInPeriod.reduce((acc, deposit) => {
      const key = deposit.wasteType || "outros";
      const impact = calculateImpact(deposit.weight, key);
      if (!acc[key]) acc[key] = { key, ewasteKg: 0, co2Kg: 0, deposits: 0 };
      acc[key].ewasteKg += impact.ewasteKg;
      acc[key].co2Kg += impact.co2Kg;
      acc[key].deposits += 1;
      return acc;
    }, {})
  ).sort((a, b) => b[dashboardMetric] - a[dashboardMetric]);
  const filteredApproved = dashboardCategory
    ? approvedInPeriod.filter((d) => d.wasteType === dashboardCategory)
    : approvedInPeriod;
  const dashboardImpact = calculateAggregateImpact(filteredApproved);
  const maxCategoryValue = Math.max(...categoryData.map((category) => category[dashboardMetric]), 1);
  const pendingInPeriod = periodDeposits.filter((d) => d.status === "pending");
  const rejectedInPeriod = periodDeposits.filter((d) => d.status === "rejected");
  const statusData = [
    { key: "approved", label: "Aprovados", value: approvedInPeriod.length },
    { key: "pending", label: "Pendentes", value: pendingInPeriod.length },
    { key: "rejected", label: "Rejeitados", value: rejectedInPeriod.length },
  ];
  const maxRankingPoints = Math.max(...classRankings.map((college) => college.points), 1);
  const approvalRate = periodDeposits.length
    ? Math.round((approvedInPeriod.length / periodDeposits.length) * 100)
    : 0;
  const reviewedInPeriod = approvedInPeriod.length + rejectedInPeriod.length;
  const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const dayDeposits = deposits.filter((deposit) => deposit.status === "approved" && String(deposit.date).slice(0, 10) === key);
    const impact = calculateAggregateImpact(dayDeposits);
    return { key, label: date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), co2Kg: impact.co2Kg, deposits: dayDeposits.length };
  });
  const maxWeeklyCo2 = Math.max(...weeklyActivity.map((day) => day.co2Kg), 1);
  const attentionBins = bins.filter((bin) => bin.capacity_pct >= 80 || bin.status !== "online");

  return (
    <div className="admin container">
      <p className="eyebrow">Painel administrativo</p>
      <h1 className="display admin-title">Gestão da Lixeira Tech</h1>

      <div className="admin-stats-grid">
        <Card><span className="mono fs-mono-lg text-accent">{globalStats?.totalUsers ?? "—"}</span><p className="text-dim">usuários cadastrados</p></Card>
        <Card><span className="mono fs-mono-lg text-accent">{globalStats?.totalDeposits ?? "—"}</span><p className="text-dim">depósitos aprovados</p></Card>
        <Card><span className="mono fs-mono-lg text-accent">{globalStats?.todayDeposits ?? "—"}</span><p className="text-dim">depósitos hoje</p></Card>
        <Card><span className="mono fs-mono-lg admin-dashboard-pending">{attentionBins.length}</span><p className="text-dim">lixeiras exigem atenção</p></Card>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admin-tab-btn ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label} {t.key === "pending" && pending.length > 0 && `(${pending.length})`}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section className="admin-dashboard">
          <div className="admin-dashboard-header">
            <div>
              <p className="eyebrow">Monitoramento administrativo</p>
              <h2 className="display">Visão geral do impacto</h2>
            </div>
            <Button variant="ghost" onClick={loadAll}>Atualizar dados</Button>
          </div>

          <div className="admin-dashboard-layout">
            <aside className="admin-dashboard-rail">
              <div>
                <p className="eyebrow">Central de controle</p>
                <h3 className="display">Avaliação em tempo real</h3>
              </div>
              <div className="admin-dashboard-gauges">
                <div className="admin-dashboard-gauge" style={{ "--gauge-value": `${approvalRate * 3.6}deg` }}>
                  <span className="mono">{approvalRate}%</span>
                  <small>aprovação</small>
                </div>
                <div className="admin-dashboard-gauge admin-dashboard-gauge-cyan" style={{ "--gauge-value": `${Math.min(reviewedInPeriod * 18, 360)}deg` }}>
                  <span className="mono">{reviewedInPeriod}</span>
                  <small>avaliados</small>
                </div>
              </div>
              <div className="admin-dashboard-rail-status">
                <span className="text-dim">Fila atual</span>
                <strong className="mono">{pending.length} pendente(s)</strong>
              </div>
              <Button variant="ghost" onClick={() => setTab("pending")}>Abrir aprovações</Button>
            </aside>

            <div className="admin-dashboard-main">
          <div className="admin-dashboard-controls" aria-label="Período do dashboard">
            {DASHBOARD_PERIODS.map((period) => (
              <button
                key={period.key}
                className={`admin-dashboard-filter ${dashboardPeriod === period.key ? "active" : ""}`}
                onClick={() => { setDashboardPeriod(period.key); setDashboardCategory(null); }}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="admin-dashboard-stats">
            <Card><span className="mono fs-mono-lg text-accent">{approvedInPeriod.length}</span><p className="text-dim">depósitos aprovados</p></Card>
            <Card><span className="mono fs-mono-lg admin-dashboard-pending">{pendingInPeriod.length}</span><p className="text-dim">aguardando avaliação</p></Card>
            <Card><span className="mono fs-mono-lg text-accent">{dashboardImpact.ewasteKg} kg</span><p className="text-dim">e-lixo desviado</p></Card>
            <Card><span className="mono fs-mono-lg text-accent">{dashboardImpact.co2Kg} kg</span><p className="text-dim">CO2 evitado</p></Card>
            <Card><span className="mono fs-mono-lg text-accent">{dashboardImpact.treesEquivalent.toFixed(2)}</span><p className="text-dim">árvores equivalentes</p></Card>
          </div>

          <div className="admin-dashboard-grid">
            <Card className="admin-dashboard-card">
              <div className="admin-dashboard-card-heading">
                <div>
                  <p className="eyebrow">Impacto por categoria</p>
                  <h3 className="display">{dashboardMetric === "co2Kg" ? "CO2 evitado" : "E-lixo desviado"}</h3>
                </div>
                <div className="admin-chart-actions">
                  <div className="admin-metric-toggle">
                    <button className={dashboardMetric === "co2Kg" ? "active" : ""} onClick={() => setDashboardMetric("co2Kg")}>CO2</button>
                    <button className={dashboardMetric === "ewasteKg" ? "active" : ""} onClick={() => setDashboardMetric("ewasteKg")}>E-lixo</button>
                  </div>
                  {dashboardCategory && <Button variant="ghost" onClick={() => setDashboardCategory(null)}>Ver todas</Button>}
                </div>
              </div>
              {categoryData.length === 0 ? <p className="text-dim">Ainda não há depósitos aprovados nesse período.</p> : (
                <div className="admin-impact-chart">
                  {categoryData.map((category) => (
                    <button
                      key={category.key}
                      className={`admin-impact-chart-row ${dashboardCategory === category.key ? "active" : ""}`}
                      onClick={() => setDashboardCategory(dashboardCategory === category.key ? null : category.key)}
                    >
                      <span className="mono">{category.key}</span>
                      <span className="admin-impact-chart-track"><span style={{ width: `${(category[dashboardMetric] / maxCategoryValue) * 100}%` }} /></span>
                      <strong className="mono">{category[dashboardMetric].toFixed(1)} kg</strong>
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="admin-dashboard-card">
              <p className="eyebrow">Avaliações</p>
              <h3 className="display">Status dos depósitos</h3>
              <div className="admin-status-summary">
                <div><span className="text-accent mono">{approvalRate}%</span><p className="text-dim">taxa de aprovação</p></div>
                <div><span className="mono">{pendingInPeriod.length}</span><p className="text-dim">pendentes no período</p></div>
              </div>
              <div className="admin-status-chart" aria-label="Distribuição dos depósitos por status">
                {statusData.map((status) => (
                  <button
                    key={status.key}
                    className={`admin-status-chart-segment ${status.key}`}
                    style={{ flexGrow: Math.max(status.value, 0.25) }}
                    onClick={() => setTab(status.key === "pending" ? "pending" : "deposits")}
                    aria-label={`${status.label}: ${status.value}`}
                  >
                    <span>{status.value}</span>
                  </button>
                ))}
              </div>
              <div className="admin-status-legend">
                {statusData.map((status) => <span key={status.key} className={status.key}>{status.label}: {status.value}</span>)}
              </div>
              <Button variant="ghost" onClick={() => setTab("pending")}>Avaliar depósitos pendentes</Button>
            </Card>
          </div>

          <Card className="admin-dashboard-card admin-weekly-activity">
            <div className="admin-dashboard-card-heading">
              <div>
                <p className="eyebrow">Atividade recente</p>
                <h3 className="display">CO2 evitado nos últimos 7 dias</h3>
              </div>
              <span className="mono text-accent">{weeklyActivity.reduce((total, day) => total + day.co2Kg, 0).toFixed(1)} kg</span>
            </div>
            <div className="admin-weekly-chart" aria-label="Gráfico de CO2 evitado nos últimos 7 dias">
              {weeklyActivity.map((day) => (
                <div key={day.key} className="admin-weekly-bar" data-tooltip={`${day.label}: ${day.co2Kg.toFixed(1)} kg de CO2 · ${day.deposits} depósito(s)`}>
                  <span className="admin-weekly-bar-value mono">{day.co2Kg > 0 ? day.co2Kg.toFixed(1) : ""}</span>
                  <span className="admin-weekly-bar-track"><span style={{ height: `${(day.co2Kg / maxWeeklyCo2) * 100}%` }} /></span>
                  <span className="mono text-dim">{day.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="admin-dashboard-grid">
            <Card className="admin-dashboard-card">
              <p className="eyebrow">Ranking da comunidade</p>
              <ol className="admin-dashboard-ranking admin-ranking-chart">
                {classRankings.slice(0, 5).map((account) => (
                  <li key={account.userName}>
                    <span className="mono text-faint">#{account.rank}</span>
                    <span className="admin-ranking-chart-name">{account.userName}<span className="admin-ranking-chart-track"><span style={{ width: `${(account.points / maxRankingPoints) * 100}%` }} /></span></span>
                    <strong className="mono text-accent">{account.points} pts</strong>
                  </li>
                ))}
              </ol>
            </Card>

            <Card className="admin-dashboard-card">
              <p className="eyebrow">Fila de aprovação</p>
              <h3 className="display">Próximos depósitos</h3>
              {pending.length === 0 ? <p className="text-dim">Nenhum depósito aguardando avaliação.</p> : (
                <ol className="admin-dashboard-queue">
                  {pending.slice(0, 3).map((deposit) => (
                    <li key={deposit.id}>
                      <span>{deposit.userName}</span>
                      <span className="text-dim mono">{deposit.wasteType} · {deposit.weight} kg</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>
            </div>
          </div>
        </section>
      )}

      {tab === "pending" && (
        <div className="admin-panel">
          {pending.length === 0 && <p className="text-dim">Nenhum depósito pendente. 🎉</p>}
          <AnimatePresence>
            {pending.map((d) => {
              const impact = calculateImpact(d.weight, d.wasteType);
              return (
                <motion.div
                  key={d.id}
                  className="admin-row"
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="admin-row-info">
                    <strong>{d.userName}</strong>
                    <span className="text-dim mono"> · {d.wasteType} · {d.weight} kg</span>
                    <div className="text-dim admin-row-description">
                      {d.quantity} item(ns){d.description ? ` · ${d.description}` : " · Sem observações"}
                    </div>
                    <div className="text-accent mono admin-row-impact">
                      {impact.ewasteKg} kg de e-lixo · ~{impact.co2Kg} kg CO2 · {impact.treesEquivalent.toFixed(2)} árvores
                    </div>
                  </div>
                  <div className="admin-row-actions">
                    <Input
                      type="number"
                      className="admin-points-input"
                      placeholder={String(Math.round((d.weight || 0) * 10))}
                      value={pointsDraft[d.id] ?? ""}
                      onChange={(e) => setPointsDraft((prev) => ({ ...prev, [d.id]: e.target.value }))}
                    />
                    <Button variant="ghost" disabled={busyId === d.id} onClick={() => approve(d)}>Aprovar</Button>
                    <Button variant="danger" disabled={busyId === d.id} onClick={() => reject(d)}>Rejeitar</Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {tab === "students" && (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr><th>Usuário</th><th>Pontos</th><th>Adicionar pontos</th></tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="text-dim">{s.name}</td>
                  <td className="mono text-accent">{s.points}</td>
                  <td>
                    <div className="admin-add-points">
                      <Input
                        type="number"
                        className="admin-points-input"
                        value={addPointsDraft[s.id] || ""}
                        onChange={(e) => setAddPointsDraft((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        placeholder="+ pts"
                      />
                      <Button variant="ghost" onClick={() => addManualPoints(s.id)}>Adicionar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "deposits" && (
        <div className="admin-panel">
          {deposits.length === 0 ? (
            <p className="text-dim">Nenhum depósito registrado ainda.</p>
          ) : (
            <div className="admin-deposits-table-wrap">
              <table className="admin-table admin-deposits-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Depósito</th>
                    <th>Lixeira</th>
                    <th>Impacto</th>
                    <th>Observações</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th>Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => {
                    const impact = calculateImpact(d.weight, d.wasteType);
                    return (
                    <tr key={d.id}>
                      <td><strong>{d.userName}</strong></td>
                      <td>
                        <strong>{d.wasteType}</strong>
                        <span className="admin-table-detail text-dim mono">{d.quantity} item(ns) · {d.weight} kg</span>
                      </td>
                      <td className="text-dim">{d.binName}</td>
                      <td>
                        <div className="admin-impact-details mono">
                          <span>{impact.ewasteKg} kg e-lixo</span>
                          <span>~{impact.co2Kg} kg CO2</span>
                          <span>{impact.treesEquivalent.toFixed(2)} árvores</span>
                        </div>
                      </td>
                      <td className="text-dim">{d.description || "Sem observações"}</td>
                      <td className="mono text-dim">{new Date(d.date).toLocaleDateString("pt-BR")}</td>
                      <td><span className={`admin-status admin-status-${d.status}`}>{statusLabel(d.status)}</span></td>
                      <td className="mono text-accent">{d.status === "approved" ? `+${d.points}` : "—"}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "bins" && (
        <section className="admin-bins">
          <div className="admin-bins-header"><div><p className="eyebrow">Infraestrutura simulada</p><h2 className="display">Lixeiras físicas</h2></div><p className="text-dim">Capacidade é atualizada a cada depósito do quiosque.</p></div>
          {attentionBins.length > 0 && <div className="admin-bin-alert"><strong>{attentionBins.length} alerta(s)</strong><span>{attentionBins.map((bin) => `${bin.name}: ${bin.status !== "online" ? "indisponível" : `${bin.capacity_pct}% cheia`}`).join(" · ")}</span></div>}
          <div className="admin-bin-map" aria-label="Mapa ilustrativo das lixeiras cadastradas"><div><p className="eyebrow">Mapa de operação</p><strong>Unidades cadastradas</strong></div><div className="admin-bin-map-canvas">{bins.map((bin, index) => <span key={bin.id} className={`status-${bin.status}`} style={{ "--map-x": `${18 + ((index * 31) % 66)}%`, "--map-y": `${24 + ((index * 23) % 55)}%` }} title={`${bin.name} — ${bin.location}`}><i />{bin.name}</span>)}</div></div>
          <div className="admin-bins-grid">
            {bins.map((bin) => (
              <Card key={bin.id} className={`admin-bin-card status-${bin.status}`}>
                <div className="admin-bin-card-head"><div><p className="eyebrow">{bin.status === "online" ? "Online" : bin.status === "maintenance" ? "Em manutenção" : "Offline"}</p><h3 className="display">{bin.name}</h3><p className="text-dim">{bin.location}</p></div><span className="admin-bin-capacity mono">{bin.capacity_pct}%</span></div>
                <div className="admin-bin-meter"><span style={{ width: `${bin.capacity_pct}%` }} /></div>
                <p className="text-dim">Última coleta: {bin.last_collected_at ? new Date(bin.last_collected_at).toLocaleDateString("pt-BR") : "—"}</p>
                <div className="admin-bin-actions"><select value={bin.status} onChange={(event) => changeBinStatus(bin.id, event.target.value)}><option value="online">Online</option><option value="maintenance">Manutenção</option><option value="offline">Offline</option></select><Button variant="ghost" onClick={() => collectBin(bin.id)}>Registrar coleta</Button></div>
              </Card>
            ))}
          </div>
          <form className="admin-bin-create" onSubmit={createBin}><p className="eyebrow">Adicionar unidade simulada</p><Input value={binForm.name} onChange={(event) => setBinForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome da lixeira" /><Input value={binForm.location} onChange={(event) => setBinForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Localização" /><Button type="submit">Adicionar lixeira</Button></form>
        </section>
      )}

      {tab === "classes" && (
        <div className="admin-panel">
          {classRankings.length === 0 && <p className="text-dim">Nenhum usuário cadastrado ainda.</p>}
          <ol className="admin-college-ranking">
          {classRankings.map((c) => (
            <li key={c.userName} className="admin-college-ranking-row">
              <span className="admin-college-rank mono">#{c.rank}</span>
              <div>
                <h3 className="display">{c.userName}</h3>
              </div>
              <span className="mono text-accent admin-college-points">{c.points} pts</span>
            </li>
          ))}
          </ol>
        </div>
      )}
    </div>
  );
}
