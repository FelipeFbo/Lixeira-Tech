import { useMemo } from "react";
import { motion } from "framer-motion";
import "./Button.css";

/**
 * Botão do design system. Duas variantes: 'primary' (preenchido,
 * accent ácido) e 'ghost' (contorno, usado em contextos escuros
 * densos como o admin). Motion é sutil: leve escala + glow no hover,
 * nunca "espetáculo" — aqui o motion é feedback, não storytelling.
 *
 * `as` aceita tanto uma tag HTML em string ("a", "button") quanto um
 * componente (ex: <Button as={Link} to="/rota">), como o Link do
 * react-router. motion[as] só funciona para strings — para componentes
 * é preciso envolver com motion(Component).
 */
export function Button({
  children,
  variant = "primary",
  as = "button",
  className = "",
  ...props
}) {
  const Component = useMemo(
    () => (typeof as === "string" ? motion[as] || motion.button : motion.create(as)),
    [as]
  );
  return (
    <Component
      className={`btn btn-${variant} ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}
