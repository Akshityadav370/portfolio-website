import type { SpatialTrial } from "./rules";
const tracks = {
  "red-light": "/audio/world/red-light.mp3",
  mingle: "/audio/world/mingle.mp3",
  "jump-rope": "/audio/world/jump-rope.mp3",
};
/** Audio follows the game state; it never drives collision or timing. */
export function createWorldAudio() {
  let enabled = false,
    volume = 0.35,
    current: HTMLAudioElement | null = null,
    key = "",
    lastPhase = "";
  let disposed = false,
    request = 0;
  const cache = new Map<string, HTMLAudioElement>();
  function sync(game: SpatialTrial | null, paused: boolean) {
    const playing =
      !!game &&
      game.status === "playing" &&
      !paused &&
      !document.hidden &&
      enabled;
    const desired = playing
      ? game.kind === "red-light" && game.phase !== "green"
        ? ""
        : game.kind === "mingle" && game.phase !== "spinning"
          ? ""
          : game.kind
      : "";
    if (!desired) {
      request++;
      current?.pause();
      key = "";
      lastPhase = game?.phase ?? "";
      return;
    }
    const audio =
      cache.get(desired) ?? new Audio(tracks[desired as keyof typeof tracks]);
    if (!cache.has(desired)) {
      audio.loop = true;
      audio.preload = "none";
      cache.set(desired, audio);
    }
    if (key !== desired || current !== audio) {
      current?.pause();
      current = audio;
      key = desired;
    }
    if (
      game?.phase !== lastPhase &&
      (game?.phase === "green" || game?.phase === "spinning")
    )
      audio.currentTime = 0;
    lastPhase = game?.phase ?? "";
    audio.volume = volume;
    if (audio.paused) {
      const id = ++request;
      void audio
        .play()
        .then(() => {
          if (disposed || id !== request || !enabled) audio.pause();
        })
        .catch(() => {});
    }
  }
  return {
    sync,
    setEnabled(value: boolean) {
      enabled = value;
      if (!value) {
        request++;
        current?.pause();
      }
    },
    setVolume(value: number) {
      volume = value;
      if (current) current.volume = value;
    },
    dispose() {
      disposed = true;
      request++;
      for (const audio of cache.values()) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      cache.clear();
    },
  };
}
