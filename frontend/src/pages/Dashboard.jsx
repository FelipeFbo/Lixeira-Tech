import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../store/AuthContext";
import { api } from "../lib/api";
import { calculateAggregateImpact } from "../lib/impact";
import { ImpactStat, PointsBadge } from "../components/ui/ImpactStat";
import { Card } from "../components/ui/Card";
import { Timeline } from "../components/ui/Timeline";
import { Button } from "../components/ui/Button";
import { SustainabilityTree } from "../components/tree/SustainabilityTree";
import { AchievementsGrid } from "../components/achievements/AchievementsGrid";
import { evaluateAchievements } from "../data/achievements";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [ambassador, setAmbassador] = useState(null);
  const [referrals, setReferrals] = useState(null);
  const [ambassadorBusy, setAmbassadorBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      api.user.stats(user.id),
      api.deposits.listByUser(user.id),
      api.user.ranking(user.id),
      api.ambassador.eligibility(user.id),
    ])
      .then(async ([statsData, depositsData, rankingData, ambassadorData]) => {
        if (cancelled) return;
        setStats(statsData);
        setDeposits(depositsData || []);
        setRanking(rankingData);
        setAmbassador(ambassadorData);
        if (ambassadorData.status === "approved") setReferrals(await api.referrals.mine(user.id));
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user]);

  const approved = deposits.filter((d) => d.status === "approved");
  const impact = calculateAggregateImpact(approved);
  const userName = stats?.userName || user?.name || "Usuário";
  const totalPoints = stats?.totalPoints ?? user?.points ?? 0;
  const streakDays = calculateStreakDays(approved);
  const achievements = evaluateAchievements({ deposits: approved, impact, points: totalPoints });

  async function requestAmbassadorCertification() {
    if (!user) return;
    setAmbassadorBusy(true);
    try {
      await api.ambassador.request(user.id);
      setAmbassador((current) => current ? { ...current, status: "pending" } : current);
    } finally {
      setAmbassadorBusy(false);
    }
  }

  return (
    <div className="dashboard container">
      <section className="dashboard-hero">
        <p className="eyebrow">Seu impacto</p>
        <h1 className="display dashboard-title">
          {loading ? "Calculando seu impacto…" : userName}
        </h1>

        <div className="dashboard-stats">
          <ImpactStat label="kg de e-lixo desviado" value={impact.ewasteKg} suffix=" kg" />
          <ImpactStat label="kg de CO2 evitado" value={impact.co2Kg} suffix=" kg" accent="cyan" />
          <ImpactStat label="árvores equivalentes" value={impact.treesEquivalent} decimals={2} />
        </div>

        <div className="dashboard-hero-footer">
          <PointsBadge points={stats?.totalPoints ?? user?.points ?? 0} />
          <Button as={Link} to="/depositar">Registrar novo depósito</Button>
        </div>

        {user?.kioskCode && (
          <div className="dashboard-kiosk-code">
            <div className="dashboard-qr" title="QR Code de acesso ao quiosque"><QRCodeSVG value={user.kioskCode} size={164} level="H" includeMargin /></div>
            <div><p className="eyebrow">Seu acesso ao quiosque</p><strong className="mono">{user.kioskCode}</strong><p className="text-dim">Use este código na lixeira física ou abra o modo simulado.</p><Link to="/quiosque" className="text-accent mono">abrir quiosque →</Link></div>
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        <Card className="dashboard-ranking-card">
          <p className="eyebrow">Ranking da comunidade</p>
          <div className="dashboard-ranking-row">
            <span className="text-dim">Posição global</span>
            <span className="mono">#{ranking?.global ?? "—"}</span>
          </div>
          <Link to="/ranking" className="text-accent mono dashboard-ranking-link">
            ver impacto da comunidade →
          </Link>
        </Card>
      </section>

      <section className="dashboard-ambassador">
        <Card className="dashboard-ambassador-card">
          <p className="eyebrow">Programa de embaixadores</p>
          <h2 className="display">{ambassador?.status === "approved" ? "Você é um Embaixador" : "Torne-se Embaixador"}</h2>
          {ambassador?.status === "approved" ? <>
            <p className="text-dim">Seu certificado está ativo e pode ser validado pelo código oficial.</p>
            <div className="dashboard-ambassador-actions"><Button as={Link} to={`/certificado/${ambassador.certificateCode}`}>Ver certificado</Button><Button as={Link} to="/meu-crm" variant="ghost">Abrir meu CRM</Button></div>
            <div className="dashboard-ambassador-progress"><span>Seu link: <strong className="mono">{`${window.location.origin}/cadastro?ref=${referrals?.code || "…"}`}</strong></span><span>{referrals?.total ?? 0} indicação(ões) cadastradas · {referrals?.qualified ?? 0} qualificadas · {referrals?.rewardPoints ?? 0} pontos de recompensa</span></div>
          </> : ambassador?.status === "pending" ? <p className="dashboard-ambassador-pending">Sua solicitação está em análise pela equipe Lixeira Tech.</p> : <>
            <p className="text-dim">Alcance a conquista <strong>Protetor do Planeta</strong>, desviando {ambassador?.minEwasteKg ?? 50} kg de e-lixo em depósitos aprovados.</p>
            <div className="dashboard-ambassador-progress"><span>{ambassador?.ewasteKg ?? 0} / {ambassador?.minEwasteKg ?? 50} kg de e-lixo</span><span>{ambassador?.approvedDeposits ?? 0} depósitos aprovados</span></div>
            {ambassador?.eligible ? <Button onClick={requestAmbassadorCertification} disabled={ambassadorBusy}>{ambassadorBusy ? "Enviando…" : "Solicitar certificação"}</Button> : <p className="dashboard-ambassador-locked">Continue seu impacto para desbloquear a solicitação.</p>}
          </>}
        </Card>
      </section>

      <section className="dashboard-timeline">
        <p className="eyebrow">Histórico de depósitos</p>
        <Timeline deposits={deposits} />
      </section>

      <section className="dashboard-tree">
        <SustainabilityTree ewasteKg={impact.ewasteKg} points={totalPoints} streakDays={streakDays} />
      </section>

      <section className="dashboard-achievements">
        <p className="eyebrow">Conquistas ambientais</p>
        <AchievementsGrid achievements={achievements} />
      </section>
    </div>
  );
}

// Conta dias consecutivos (até hoje) com pelo menos um depósito aprovado.
function calculateStreakDays(approvedDeposits) {
  if (!approvedDeposits.length) return 0;

  const days = new Set(
    approvedDeposits
      .map((d) => {
        const date = new Date(d.created_at);
        return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
      })
      .filter(Boolean)
  );

  if (days.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
