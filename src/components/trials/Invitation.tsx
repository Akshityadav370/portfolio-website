"use client";

import { useState } from "react";
import Symbols from "./Symbols";
import { profile } from "@/data/resume";
import { useTrialAudio } from "./TrialAudio";

export default function Invitation() {
  const [flipped, setFlipped] = useState(false);
  const { cue } = useTrialAudio();
  return (
    <div className="invitation-object">
      <button
        type="button"
        className={`invitation-card ${flipped ? "is-flipped" : ""}`}
        aria-label={
          flipped
            ? "Show front of invitation card"
            : "Turn over the invitation card"
        }
        aria-pressed={flipped}
        onClick={() => {
          setFlipped(!flipped);
          cue("room");
        }}
      >
        <span className="invitation-face invitation-front">
          <Symbols />
        </span>
        <span className="invitation-face invitation-back">
          <span>YOU HAVE BEEN INVITED</span>
          <strong>PLAYER 370</strong>
          <span>{profile.email}</span>
          <small>ONE CURIOUS MIND. MANY POSSIBILITIES.</small>
        </span>
      </button>
      <p>
        AN INVITATION FOR THE CURIOUS <span>↻ TURN OVER</span>
      </p>
    </div>
  );
}
