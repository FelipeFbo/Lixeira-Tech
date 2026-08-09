import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthAmbient } from "../components/auth/AuthAmbient";
import { Field, Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../store/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(form.email, form.password);
      navigate(user.is_admin ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-split">
      <AuthAmbient />
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <p className="eyebrow">Bem-vindo de volta</p>
          <h1 className="display auth-title">Entrar</h1>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="E-mail">
              <Input
                type="text"
                required
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@escola.com"
              />
            </Field>
            <Field label="Senha">
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
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
            </AnimatePresence>

            <Button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="auth-switch text-dim">
            Ainda não tem conta? <Link to="/cadastro" className="text-accent">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
