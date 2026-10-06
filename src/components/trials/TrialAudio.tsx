"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { trialsAudio } from "@/data/trials-audio";

type Cue =
  "start" | "green" | "red" | "warning" | "win" | "lose" | "jump" | "room";
type AudioControls = {
  enabled: boolean;
  toggle: () => void;
  cue: (kind: Cue) => void;
  setCarousel: (on: boolean) => void;
};
const AudioContextValue = createContext<AudioControls>({
  enabled: false,
  toggle: () => {},
  cue: () => {},
  setCarousel: () => {},
});
export const useTrialAudio = () => useContext(AudioContextValue);

export function TrialAudioProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const context = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const music = useRef<HTMLAudioElement | null>(null);
  const carousel = useRef(false);

  const syncMusic = useCallback(() => {
    const track =
      carousel.current && trialsAudio.carousel
        ? trialsAudio.carousel
        : trialsAudio.ambience;
    if (!enabledRef.current || document.hidden || !track) {
      music.current?.pause();
      return;
    }
    if (!music.current || music.current.getAttribute("src") !== track.src) {
      music.current?.pause();
      music.current = new Audio(track.src);
      music.current.loop = true;
      music.current.volume = 0.18;
    }
    void music.current.play().catch(() => {});
  }, []);

  const cue = useCallback((kind: Cue) => {
    const ctx = context.current;
    if (!enabledRef.current || !ctx || !gain.current || document.hidden) return;
    const notes: Record<Cue, number[]> = {
      start: [330, 440],
      green: [440, 660],
      red: [180],
      warning: [330, 330],
      win: [440, 554, 660],
      lose: [220, 147],
      jump: [520],
      room: [392, 523],
    };
    notes[kind].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const envelope = ctx.createGain();
      const at = ctx.currentTime + index * 0.12;
      osc.type = "sine";
      osc.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, at);
      envelope.gain.linearRampToValueAtTime(0.14, at + 0.015);
      envelope.gain.exponentialRampToValueAtTime(0.001, at + 0.23);
      osc.connect(envelope);
      envelope.connect(gain.current!);
      osc.start(at);
      osc.stop(at + 0.25);
      osc.onended = () => {
        osc.disconnect();
        envelope.disconnect();
      };
    });
  }, []);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    if (next && !context.current) {
      try {
        context.current = new AudioContext();
        gain.current = context.current.createGain();
        gain.current.gain.value = 0.65;
        gain.current.connect(context.current.destination);
      } catch {
        return;
      }
    }
    enabledRef.current = next;
    setEnabled(next);
    if (next) {
      void context.current?.resume();
      cue("start");
    } else {
      void context.current?.suspend();
    }
    syncMusic();
  }, [cue, syncMusic]);

  const setCarousel = useCallback(
    (on: boolean) => {
      carousel.current = on;
      syncMusic();
    },
    [syncMusic],
  );
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) void context.current?.suspend();
      else if (enabledRef.current) void context.current?.resume();
      syncMusic();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      music.current?.pause();
      void context.current?.close();
    };
  }, [syncMusic]);

  return (
    <AudioContextValue.Provider value={{ enabled, toggle, cue, setCarousel }}>
      {children}
    </AudioContextValue.Provider>
  );
}

export function SoundToggle() {
  const { enabled, toggle } = useTrialAudio();
  return (
    <button
      type="button"
      className="trial-sound"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute sound" : "Enable sound"}
    >
      <span
        className={`sound-bars ${enabled ? "sound-on" : ""}`}
        aria-hidden="true"
      >
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>SOUND {enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
