/**
 * O Lenis é criado uma única vez em `useLenis` (montado no Layout).
 * Guardamos a instância aqui para que outras partes do app (como o
 * snap de slides do StoryDeck) possam pedir um `scrollTo` suave e
 * consistente com o mesmo motor de scroll do resto do site, em vez de
 * usar `window.scrollTo` cru (que ficaria "brigando" com o Lenis).
 */
let lenisInstance = null;

export function setLenisInstance(instance) {
  lenisInstance = instance;
}

export function getLenis() {
  return lenisInstance;
}
