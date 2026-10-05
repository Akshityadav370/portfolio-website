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
  let context: AudioContext | null = null;
  const effects = new Set<AudioScheduledSourceNode>();
  function stopEffects() {
    for (const node of effects) {
      try {
        node.stop();
      } catch {
        /* already ended */
      }
    }
    effects.clear();
  }
  function shot() {
    if (
      !enabled ||
      disposed ||
      document.hidden ||
      !context ||
      context.state !== "running"
    )
      return;
    const now = context.currentTime;
    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * 0.14),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp((-i / data.length) * 5);
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume * 0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    effects.add(noise);
    noise.onended = () => {
      effects.delete(noise);
      noise.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    noise.start(now);
    noise.stop(now + 0.15);
    const thump = context.createOscillator(),
      envelope = context.createGain();
    thump.type = "triangle";
    thump.frequency.setValueAtTime(110, now);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    envelope.gain.setValueAtTime(volume * 0.35, now);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    thump.connect(envelope);
    envelope.connect(context.destination);
    effects.add(thump);
    thump.onended = () => {
      effects.delete(thump);
      thump.disconnect();
      envelope.disconnect();
    };
    thump.start(now);
    thump.stop(now + 0.13);
  }
  function sync(game: SpatialTrial | null, paused: boolean) {
    if (paused || !game || game.status === "playing" || document.hidden)
      stopEffects();
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
    shot,
    setEnabled(value: boolean) {
      enabled = value;
      if (value) {
        try {
          context ??= new AudioContext();
          void context.resume().catch(() => {});
        } catch {
          /* music remains available */
        }
      }
      if (!value) {
        request++;
        current?.pause();
        stopEffects();
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
      stopEffects();
      void context?.close().catch(() => {});
      context = null;
    },
  };
}
