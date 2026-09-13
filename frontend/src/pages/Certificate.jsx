import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/Button";
import "./Certificate.css";

export default function Certificate() {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.certificates.verify(code).then(setCertificate).catch((requestError) => setError(requestError.message));
  }, [code]);

  return (
    <main className="certificate-page container">
      {error ? <section className="certificate-card certificate-invalid"><p className="eyebrow">Validação de certificado</p><h1 className="display">Certificado não encontrado</h1><p className="text-dim">{error}</p><Link className="text-accent mono" to="/">voltar para o início →</Link></section> : !certificate ? <p className="text-dim">Validando certificado…</p> : <section className="certificate-card">
        <p className="eyebrow">Lixeira Tech certifica</p>
        <div className="certificate-seal">LT</div>
        <p className="certificate-presented">Certificamos que</p>
        <h1 className="display">{certificate.name}</h1>
        <p className="certificate-title">é oficialmente um<br /><strong>{certificate.title}</strong></p>
        <p className="certificate-description">Em reconhecimento ao compromisso contínuo com o descarte responsável de eletrônicos e a construção de uma cidade mais sustentável.</p>
        <div className="certificate-meta"><span>Emitido em {new Date(certificate.approvedAt).toLocaleDateString("pt-BR")}</span><strong className="mono">{certificate.code}</strong></div>
        <div className="certificate-actions"><Button onClick={() => window.print()}>Imprimir certificado</Button><Link to="/" className="text-accent mono">Lixeira Tech</Link></div>
      </section>}
    </main>
  );
}
