import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../store/AuthContext";
import { useTheme } from "../../store/ThemeContext";
import "./Nav.css";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`nav ${scrolled ? "nav-scrolled" : ""}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-inner container">
        <Link to="/" className="nav-logo mono">
          LIXEIRA<span className="text-accent">TECH</span>
        </Link>

        {user ? (
          <nav className="nav-links">
            {isAdmin ? (
              <><NavLink to="/admin" className="nav-link">Admin</NavLink><NavLink to="/quiosque" className="nav-link">Quiosque</NavLink></>
            ) : (
              <>
                <NavLink to="/dashboard" className="nav-link">Seu impacto</NavLink>
                <NavLink to="/depositar" className="nav-link">Registrar</NavLink>
                <NavLink to="/ranking" className="nav-link">Comunidade</NavLink>
                <NavLink to="/panorama" className="nav-link">Panorama</NavLink>
                <NavLink to="/museu" className="nav-link">Museu</NavLink>
                <NavLink to="/quiosque" className="nav-link">Quiosque</NavLink>
              </>
            )}
            <button className="nav-link nav-logout" onClick={logout}>Sair</button>
          </nav>
        ) : (
          <nav className="nav-links">
            <NavLink to="/panorama" className="nav-link">Panorama</NavLink>
            <NavLink to="/museu" className="nav-link">Museu</NavLink>
            <NavLink to="/quiosque" className="nav-link">Quiosque</NavLink>
            <NavLink to="/login" className="nav-link">Entrar</NavLink>
            <Link to="/cadastro" className="nav-cta mono">Cadastre-se</Link>
          </nav>
        )}
        <button
          type="button"
          className="nav-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
        >
          {theme === "light" ? "☾" : "☀"}
        </button>
      </div>
    </motion.header>
  );
}
