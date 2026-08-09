import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import "./AssistantWidget.css";

const SUGGESTIONS = [
  "Posso jogar pilhas no lixo comum?",
  "Como descartar baterias de celular?",
  "Meu notebook queimou. O que faço?",
  "Um carregador pode ser reciclado?",
];

const WELCOME = {
  role: "assistant",
  content:
    "Oi! Eu sou o assistente da Lixeira Tech 🌱 Posso te ajudar com dúvidas sobre descarte de eletrônicos, pilhas e baterias. O que você quer saber?",
};

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const reply = await api.assistant.chat(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply.content }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Não consegui me conectar agora. De forma geral: eletrônicos, pilhas e baterias nunca vão no lixo comum — leve a um ponto de coleta. Tente de novo em instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.button
        className="assistant-fab"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir assistente"
      >
        {open ? "×" : "💬"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="assistant-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="assistant-header">
              <span className="mono text-accent">ASSISTENTE LIXEIRA TECH</span>
              <button className="assistant-close" onClick={() => setOpen(false)} aria-label="Fechar">×</button>
            </div>

            <div className="assistant-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`assistant-message assistant-message-${m.role}`}>
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="assistant-message assistant-message-assistant assistant-typing">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="assistant-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="assistant-suggestion" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              className="assistant-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                className="assistant-input"
                placeholder="Digite sua dúvida…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="assistant-send mono" type="submit" disabled={loading}>
                enviar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
