import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { WASTE_CATEGORIES, calculateImpact } from "../lib/impact";
import { LineIcon } from "../components/ui/LineIcon";
import "./Kiosk.css";

const STEPS = { welcome: "welcome", identify: "identify", item: "item", confirm: "confirm", opening: "opening", complete: "complete" };

export default function Kiosk() {
  const [step, setStep] = useState(STEPS.welcome);
  const [bins, setBins] = useState([]);
  const [code, setCode] = useState("");
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(null);
  const [binId, setBinId] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.kiosk.bins().then((items) => {
      setBins(items);
      setBinId(items.find((bin) => bin.status === "online")?.id || "");
    }).catch(() => setError("Não foi possível conectar às lixeiras."));
  }, []);

  const selectedBin = bins.find((bin) => bin.id === binId);
  const impact = category ? calculateImpact(Number(weight) || 0, category.key) : null;

  async function identifyUser(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const account = await api.kiosk.userByCode(code);
      setUser(account);
      setStep(STEPS.item);
    } catch (requestError) {
      setError(requestError.message || "Código não encontrado.");
    } finally {
      setBusy(false);
    }
  }

  function simulateScale() {
    setWeight((0.2 + Math.random() * 3.8).toFixed(1));
  }

  async function submitDeposit() {
    if (!user || !category || !binId || Number(weight) <= 0) return;
    setBusy(true);
    setError("");
    try {
      await api.deposits.create({ userId: user.id, binId, wasteType: category.key, quantity: Number(quantity) || 1, weight: Number(weight), description: "Registrado no quiosque simulado" });
      setStep(STEPS.opening);
      window.setTimeout(() => setStep(STEPS.complete), 1400);
    } catch (requestError) {
      setError(requestError.message || "Não foi possível registrar o depósito.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(STEPS.welcome);
    setUser(null);
    setCategory(null);
    setCode("");
    setWeight("");
    setQuantity("1");
    setError("");
  }

  return (
    <main className="kiosk">
      <header className="kiosk-header">
        <Link to="/" className="kiosk-logo mono">LIXEIRA<span>TECH</span></Link>
        <span className="kiosk-status mono"><i /> estação online</span>
      </header>

      <section className="kiosk-shell">
        {step === STEPS.welcome && (
          <div className="kiosk-welcome">
            <p className="eyebrow">Descarte inteligente</p>
            <LineIcon name="leaf" size={88} />
            <h1 className="display">Seu eletrônico merece um destino melhor.</h1>
            <p>Registre o descarte, use a lixeira e acompanhe o seu impacto ambiental.</p>
            <button className="kiosk-primary" onClick={() => setStep(STEPS.identify)}>Começar depósito</button>
            <small>Sem conta? <Link to="/cadastro">Crie seu cadastro pessoal</Link></small>
          </div>
        )}

        {step === STEPS.identify && (
          <form className="kiosk-card" onSubmit={identifyUser}>
            <p className="eyebrow">Identificação rápida</p>
            <h1 className="display">Aproxime ou digite seu QR Code</h1>
            <div className="kiosk-qr-placeholder" aria-label="Leitor de QR Code simulado"><span>⌁</span><small>LEITOR SIMULADO</small></div>
            <label className="kiosk-label">Código pessoal
              <input autoFocus value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="EX: A1B2C3D4" maxLength="8" />
            </label>
            {error && <p className="kiosk-error">{error}</p>}
            <button className="kiosk-primary" disabled={busy || !code}>{busy ? "Lendo…" : "Simular leitura"}</button>
            <button type="button" className="kiosk-secondary" onClick={() => setStep(STEPS.welcome)}>Voltar</button>
          </form>
        )}

        {step === STEPS.item && (
          <div className="kiosk-card kiosk-item-flow">
            <p className="eyebrow">Olá, {user?.name}</p>
            <h1 className="display">O que você vai descartar?</h1>
            <div className="kiosk-categories">
              {WASTE_CATEGORIES.map((item) => (
                <button key={item.key} className={category?.key === item.key ? "active" : ""} onClick={() => setCategory(item)}>
                  <LineIcon name={item.icon} size={34} /><span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="kiosk-form-grid">
              <label className="kiosk-label">Peso (kg)<input type="number" min="0.1" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="0.0" /></label>
              <label className="kiosk-label">Itens<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
              <button type="button" className="kiosk-scale" onClick={simulateScale}>⚖ Simular balança</button>
            </div>
            <label className="kiosk-label">Escolha a lixeira
              <select value={binId} onChange={(event) => setBinId(event.target.value)}>
                {bins.map((bin) => <option value={bin.id} key={bin.id} disabled={bin.status !== "online"}>{bin.name} · {bin.location} · {bin.status === "online" ? `${bin.capacity}%` : "indisponível"}</option>)}
              </select>
            </label>
            {error && <p className="kiosk-error">{error}</p>}
            <button className="kiosk-primary" disabled={!category || Number(weight) <= 0 || !selectedBin || selectedBin.status !== "online"} onClick={() => setStep(STEPS.confirm)}>Continuar</button>
          </div>
        )}

        {step === STEPS.confirm && (
          <div className="kiosk-card kiosk-confirm">
            <p className="eyebrow">Confira seu depósito</p>
            <h1 className="display">{category?.label}</h1>
            <div className="kiosk-confirm-grid"><span>{quantity} item(ns)</span><strong>{weight} kg</strong><span>{selectedBin?.name}</span><strong>~{impact?.co2Kg} kg CO2</strong></div>
            <p>Ao confirmar, o compartimento será aberto em modo simulado. A pontuação entra após a avaliação.</p>
            {error && <p className="kiosk-error">{error}</p>}
            <button className="kiosk-primary" disabled={busy} onClick={submitDeposit}>{busy ? "Registrando…" : "Abrir compartimento"}</button>
            <button className="kiosk-secondary" onClick={() => setStep(STEPS.item)}>Corrigir informações</button>
          </div>
        )}

        {step === STEPS.opening && <div className="kiosk-opening"><div className="kiosk-door"><span /></div><h1 className="display">Compartimento aberto</h1><p>Deposite o item na lixeira.</p></div>}

        {step === STEPS.complete && (
          <div className="kiosk-welcome">
            <p className="eyebrow">Depósito registrado</p><LineIcon name="leaf" size={88} />
            <h1 className="display">Obrigado por descartar corretamente.</h1>
            <p>Seu depósito está aguardando validação. O impacto e os pontos aparecerão na sua conta após a avaliação.</p>
            <button className="kiosk-primary" onClick={reset}>Finalizar sessão</button>
          </div>
        )}
      </section>
      <footer className="kiosk-footer mono">SIMULAÇÃO DE HARDWARE · CAPACIDADE: {selectedBin?.capacity ?? "—"}% · LIXEIRA TECH</footer>
    </main>
  );
}
