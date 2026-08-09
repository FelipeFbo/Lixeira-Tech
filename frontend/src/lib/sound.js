/**
 * ============================================================
 * MOTOR DE SOM AMBIENTE — síntese via Web Audio API
 * ============================================================
 * Inspirado no toggle "Sound: Off/On" do lemansclassic.richardmille.com
 * e no "Click to enable sound" do aether1.ai: nada de arquivos de áudio
 * pesados, os efeitos (tick, hover, whoosh, chime) são sintetizados em
 * tempo real com osciladores. Isso mantém o bundle leve e os sons
 * consistentes com a identidade sonora do site (tons curtos, discretos,
 * afinados na mesma "cor" tonal — nunca um bipe genérico de UI).
 *
 * Estado (ligado/desligado) persiste em localStorage para lembrar a
 * preferência do usuário entre visitas, como no site de referência.
 */

const STORAGE_KEY = "lixeiratech:sound-enabled";

let audioCtx = null;
let masterGain = null;

function ensureContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.16; // tudo discreto — nunca deve competir com o conteúdo
  masterGain.connect(audioCtx.destination);
  return audioCtx;
}

function tone({ freq = 440, duration = 0.12, type = "sine", startGain = 0.5, glideTo = null, delay = 0 }) {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime + delay;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, now + duration);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(startGain, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export const sound = {
  isEnabled() {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  },

  setEnabled(value) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    if (value) ensureContext();
  },

  // clique curto e seco — usado em toggles e botões primários
  click() {
    tone({ freq: 720, duration: 0.045, type: "square", startGain: 0.28 });
  },

  // tick suave de hover — quase inaudível, textura de "precisão"
  hover() {
    tone({ freq: 1180, duration: 0.03, type: "sine", startGain: 0.12 });
  },

  // chime de duas notas ao ligar o som — assinatura sonora do site
  chime() {
    tone({ freq: 587.33, duration: 0.16, type: "triangle", startGain: 0.3 });
    tone({ freq: 880, duration: 0.22, type: "triangle", startGain: 0.24, delay: 0.06 });
  },

  // whoosh grave ao entrar numa nova seção do scroll
  whoosh() {
    tone({ freq: 160, glideTo: 60, duration: 0.4, type: "sine", startGain: 0.14 });
  },

  // "tick" de ponteiro de relógio — usado no dial de impacto
  tick() {
    tone({ freq: 2200, duration: 0.018, type: "square", startGain: 0.1 });
  },
};
