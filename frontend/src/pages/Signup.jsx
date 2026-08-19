import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthAmbient } from "../components/auth/AuthAmbient";
import { Field, Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../store/AuthContext";
import "./Auth.css";

const EMPTY = { name: "", email: "", password: "" };

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await signup(form);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-split">
      <AuthAmbient />
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">Comece agora</p>
          <h1 className="display auth-title">Criar conta</h1>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Nome completo">
              <Input required value={form.name} onChange={update("name")} placeholder="Ex: Ana Silva" />
            </Field>
            <Field label="E-mail">
              <Input type="email" required value={form.email} onChange={update("email")} placeholder="voce@email.com" />
            </Field>
            <Field label="Senha">
              <Input type="password" required value={form.password} onChange={update("password")} placeholder="••••••••" />
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
                  Conta criada! Redirecionando…
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Criando…" : "Criar conta"}
            </Button>
          </form>

          <p className="auth-switch text-dim">
            Já tem conta? <Link to="/login" className="text-accent">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
