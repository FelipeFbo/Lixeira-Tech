import { Component } from "react";

/**
 * Rede de segurança: se algum trecho da landing quebrar em runtime
 * (ex: um bug de terceiros, uma API instável), isso evita que a
 * página inteira vá para tela preta — só aquele bloco específico
 * mostra um fallback discreto, o resto do site continua funcionando.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="mono text-faint" style={{ padding: "2rem", textAlign: "center" }}>
            Não foi possível carregar este bloco.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
