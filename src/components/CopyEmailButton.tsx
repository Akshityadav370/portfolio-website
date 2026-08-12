"use client";

import { useState } from "react";

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const RESET_MS = 1800;

// Secondary path next to the mailto button — mailto is dead for
// Gmail-webmail-only visitors, so copying the address directly is the
// reliable one for a lot of people.
export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), RESET_MS);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied!" : "Copy email address"}
      aria-label={copied ? "Email address copied" : "Copy email address"}
      className="glass-chip flex h-12 items-center gap-2 rounded-full border border-edge px-4 font-mono text-sm text-muted transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent"
    >
      <span className={copied ? "text-accent" : ""}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
      {copied ? "copied" : "copy"}
    </button>
  );
}
