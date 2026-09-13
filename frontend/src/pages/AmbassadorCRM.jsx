import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { api } from "../lib/api";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import "./AmbassadorCRM.css";

function firstName(name = "") {
  return String(name).trim().split(/\s+/)[0] || "Indicado";
}

export default function AmbassadorCRM() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.referrals.mine(user.id).then(setData).catch((err) => setError(err.message));
  }, [user]);

  const referralLink = useMemo(() => data?.code ? `${window.location.origin}/cadastro?ref=${data.code}` : "", [data]);
  const pending = data?.referrals?.filter((referral) => referral.status === "pending").length ?? 0;
  const conversionRate = data?.total ? Math.round((data.qualified / data.total) * 100) : 0;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Não foi possível copiar automaticamente. Selecione o link e copie.");
    }
  }

  if (error) return <div className="ambassador-crm container"><p className="eyebrow">Meu CRM</p><h1 className="display">Área de embaixador</h1><Card><p className="text-dim">{error}</p><Link className="text-accent mono" to="/dashboard">voltar ao Dashboard →</Link></Card></div>;

  return <div className="ambassador-crm container">
    <div className="ambassador-crm-head"><div><p className="eyebrow">Meu CRM de impacto</p><h1 className="display">Suas indicações</h1><p className="text-dim">Acompanhe os cadastros feitos pelo seu link e as recompensas liberadas.</p></div><Link className="text-accent mono" to="/dashboard">← voltar ao Dashboard</Link></div>

    <Card className="ambassador-crm-link"><p className="eyebrow">Seu link exclusivo</p><div><code>{referralLink || "Gerando link…"}</code><Button onClick={copyLink} disabled={!referralLink}>{copied ? "Link copiado" : "Copiar link"}</Button></div><p className="text-dim">A recompensa é liberada após o primeiro depósito aprovado de cada indicado.</p></Card>

    <div className="ambassador-crm-stats">
      <Card><strong className="mono text-accent">{data?.total ?? "—"}</strong><span>cadastros pelo seu link</span></Card>
      <Card><strong className="mono ambassador-crm-amber">{pending}</strong><span>aguardando conversão</span></Card>
      <Card><strong className="mono text-accent">{data?.qualified ?? "—"}</strong><span>indicações qualificadas</span></Card>
      <Card><strong className="mono text-accent">{conversionRate}%</strong><span>taxa de conversão</span></Card>
      <Card><strong className="mono text-accent">{data?.rewardPoints ?? "—"}</strong><span>pontos de recompensa</span></Card>
    </div>

    <section className="ambassador-crm-history"><p className="eyebrow">Histórico de indicações</p><h2 className="display">Pessoas indicadas</h2>{!data?.referrals?.length ? <Card><p className="text-dim">Ainda não há cadastros pelo seu link. Compartilhe-o para começar.</p></Card> : <div className="ambassador-crm-list">{data.referrals.map((referral) => <Card key={referral.id} className="ambassador-crm-row"><div><p className="eyebrow">{referral.status === "qualified" ? "Convertido" : "Aguardando primeiro depósito"}</p><h3>{firstName(referral.name)}</h3><p className="text-dim">Cadastro em {new Date(referral.registeredAt).toLocaleDateString("pt-BR")}</p></div><div className="ambassador-crm-row-meta"><span className={referral.status === "qualified" ? "text-accent mono" : "ambassador-crm-amber mono"}>{referral.status === "qualified" ? "Qualificado" : "Pendente"}</span><span>{referral.rewardPoints ? `+${referral.rewardPoints} pontos` : "Aguardando recompensa"}</span></div></Card>)}</div>}</section>
  </div>;
}
