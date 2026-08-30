import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthAmbient } from "../components/auth/AuthAmbient";
import { Field, Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { api } from "../lib/api";
import "./Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmation: "" });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (event) => setForm({ ...form, [field]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmation) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    try {
      await api.auth.resetPassword(form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">
      <AuthAmbient />
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">Acesso à sua conta</p>
          <h1 className="display auth-title">Redefinir senha</h1>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="E-mail cadastrado">
              <Input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                placeholder="voce@email.com"
              />
            </Field>
            <Field label="Nova senha">
              <Input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={update("password")}
                placeholder="Mínimo de 6 caracteres"
              />
            </Field>
            <Field label="Confirmar nova senha">
              <Input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.confirmation}
                onChange={update("confirmation")}
                placeholder="Repita a nova senha"
              />
            </Field>

            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  key="error"
                  className="auth-feedback auth-feedback-error mono"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  key="success"
                  className="auth-feedback auth-feedback-success mono"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Senha atualizada! Redirecionando para entrar…
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={loading || success} className="auth-submit">
              {loading ? "Atualizando…" : "Atualizar senha"}
            </Button>
          </form>

          <p className="auth-switch text-dim">
            Lembrou a senha? <Link to="/login" className="text-accent">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
