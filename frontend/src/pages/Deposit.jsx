import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../store/AuthContext";
import { api } from "../lib/api";
import { calculateImpact, WASTE_CATEGORIES } from "../lib/impact";
import { LineIcon } from "../components/ui/LineIcon";
import { Field, Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import "./Deposit.css";

const STEPS = { PICK: "pick", DETAILS: "details", DONE: "done" };

export default function Deposit() {
  const { user } = useAuth();
  const [step, setStep] = useState(STEPS.PICK);
  const [category, setCategory] = useState(null);
  const [form, setForm] = useState({ weight: "", quantity: "1", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const impactPreview = calculateImpact(Number(form.weight) || 0, category?.key);

  function pickCategory(cat) {
    setCategory(cat);
    setStep(STEPS.DETAILS);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.deposits.create({
        userId: user.id,
        wasteType: category.key,
        quantity: Number(form.quantity) || 1,
        weight: Number(form.weight),
        description: form.description,
      });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep(STEPS.PICK);
    setCategory(null);
    setForm({ weight: "", quantity: "1", description: "" });
  }

  return (
    <div className="deposit container">
      <p className="eyebrow">Registrar depósito</p>
      <h1 className="display deposit-title">
        {step === STEPS.PICK && "O que você está descartando?"}
        {step === STEPS.DETAILS && `Registrando: ${category?.label}`}
        {step === STEPS.DONE && "Depósito registrado!"}
      </h1>

      <AnimatePresence mode="wait">
        {step === STEPS.PICK && (
          <motion.div
            key="pick"
            className="deposit-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {WASTE_CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.key}
                className="deposit-category-btn"
                onClick={() => pickCategory(cat)}
                whileHover={{ y: -4, borderColor: "var(--color-accent)" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <LineIcon name={cat.icon} size={44} />
                <span className="mono">{cat.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {step === STEPS.DETAILS && (
          <motion.form
            key="details"
            className="deposit-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            <Field label="Peso aproximado (kg)">
              <Input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="Ex: 0.4"
              />
            </Field>
            <Field label="Quantidade de itens">
              <Input
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </Field>
            <Field label="Observações (opcional)">
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Ex: celular sem bateria"
              />
            </Field>

            {Number(form.weight) > 0 && (
              <motion.div
                className="deposit-preview mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Isso deve evitar aproximadamente{" "}
                <strong className="text-accent">{impactPreview.co2Kg} kg de CO2</strong>
                {" "}— sujeito à aprovação.
              </motion.div>
            )}

            {error && <p className="auth-feedback auth-feedback-error mono">{error}</p>}

            <div className="deposit-form-actions">
              <Button type="button" variant="ghost" onClick={() => setStep(STEPS.PICK)}>Voltar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Enviando…" : "Confirmar depósito"}</Button>
            </div>
          </motion.form>
        )}

        {step === STEPS.DONE && (
          <motion.div
            key="done"
            className="deposit-done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <LineIcon name="leaf" size={72} />
            <p className="deposit-done-headline display">
              Você acabou de evitar<br />
              <span className="text-accent mono">{impactPreview.co2Kg} kg de CO2</span>
            </p>
            <p className="text-dim">
              Assim que um responsável aprovar, isso entra no seu histórico e no seu impacto ambiental.
            </p>
            <Button onClick={reset}>Registrar outro depósito</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
