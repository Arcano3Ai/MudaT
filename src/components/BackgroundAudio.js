/**
 * Controlador de música ambiental MudaT ("¡Múdate!").
 * Inicia automáticamente al hacer el primer scroll (y desbloquea audio ante
 * gestos táctiles/puntero en iOS/Chrome) con botón flotante para pausar o reanudar.
 */

export function initBackgroundAudio() {
  if (typeof window === "undefined" || document.getElementById("mudat-bg-audio")) {
    return;
  }

  const audio = document.createElement("audio");
  audio.id = "mudat-bg-audio";
  audio.src = "./assets/audio/mudate.mp3";
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.35;
  document.body.appendChild(audio);

  const fab = document.createElement("button");
  fab.type = "button";
  fab.id = "mudat-audio-fab";
  fab.className = "mudat-audio-fab";
  fab.setAttribute("aria-label", "Controlar música de fondo");
  fab.title = "Música ¡Múdate!";
  document.body.appendChild(fab);

  let started = false;
  let userPaused = false;

  function updateFabUI() {
    const isPlaying = !audio.paused && !audio.ended;
    fab.classList.toggle("playing", isPlaying);
    fab.innerHTML = isPlaying
      ? `<span class="mudat-audio-eq" aria-hidden="true"><span></span><span></span><span></span></span><span class="mudat-audio-label">¡Múdate!</span>`
      : `<span class="mudat-audio-icon" aria-hidden="true">🎵</span><span class="mudat-audio-label">Música</span>`;
  }

  function detachUnlockListeners() {
    window.removeEventListener("scroll", handleScrollTrigger);
    window.removeEventListener("wheel", handleGestureTrigger);
    window.removeEventListener("touchstart", handleGestureTrigger);
    window.removeEventListener("pointerdown", handleGestureTrigger);
    window.removeEventListener("keydown", handleGestureTrigger);
  }

  async function tryPlay() {
    if (userPaused || started) return;
    try {
      await audio.play();
      started = true;
      detachUnlockListeners();
      updateFabUI();
    } catch {
      // El navegador aún requiere un gesto táctil/clic; se mantiene el listener
      updateFabUI();
    }
  }

  function handleScrollTrigger() {
    if (window.scrollY > 10 || window.pageYOffset > 10) {
      tryPlay();
    }
  }

  function handleGestureTrigger() {
    tryPlay();
  }

  window.addEventListener("scroll", handleScrollTrigger, { passive: true });
  window.addEventListener("wheel", handleGestureTrigger, { passive: true });
  window.addEventListener("touchstart", handleGestureTrigger, { passive: true });
  window.addEventListener("pointerdown", handleGestureTrigger, { passive: true });
  window.addEventListener("keydown", handleGestureTrigger, { passive: true });

  fab.addEventListener("click", async (e) => {
    e.stopPropagation();
    if (audio.paused) {
      userPaused = false;
      try {
        await audio.play();
        started = true;
        detachUnlockListeners();
      } catch {
        // Ignorar si falla
      }
    } else {
      userPaused = true;
      audio.pause();
    }
    updateFabUI();
  });

  audio.addEventListener("play", updateFabUI);
  audio.addEventListener("pause", updateFabUI);

  updateFabUI();
}
