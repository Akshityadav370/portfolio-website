"use client";

import { useEffect, useRef, useState } from "react";
import { experience, profile, projects, skillGroups } from "@/data/resume";
import { DARK_THEMES, LIGHT_THEMES } from "@/data/themes";
import { setMode, setThemeByName, shuffleTheme } from "@/lib/theme";

type Line = { kind: "cmd" | "out"; text: string };

const HELP: [string, string][] = [
  ["about", "who I am"],
  ["work", "where I've worked"],
  ["projects", "what I've built"],
  ["skills", "what I work with"],
  ["contact", "how to reach me"],
  ["resume", "open my resume (pdf)"],
  ["theme", "theme list · theme <name> · theme shuffle"],
  ["mode", "mode dark · mode light"],
  ["clear", "clear the screen"],
  ["exit", "close the terminal (or press Esc)"],
];

const COMMANDS = [
  ...HELP.map(([name]) => name),
  "help",
  "whoami",
  "ls",
  "pwd",
  "sudo",
];

function run(input: string): { out: string[]; action?: "clear" | "exit" } {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const arg = args.join(" ").toLowerCase();

  switch (cmd.toLowerCase()) {
    case "help":
      return {
        out: [
          "available commands:",
          "",
          ...HELP.map(([name, desc]) => `  ${name.padEnd(10)} ${desc}`),
        ],
      };
    case "about":
      return {
        out: [
          `${profile.name} — ${profile.role} @ ${profile.company}`,
          `${profile.location}`,
          "",
          profile.intro,
        ],
      };
    case "work":
    case "experience":
      return {
        out: experience.flatMap((job) => [
          `${job.period.padEnd(24)} ${job.company}`,
          `${" ".repeat(24)} ${job.role}`,
          "",
        ]),
      };
    case "projects":
      return {
        out: projects.map(
          (project) => `  ${project.name.padEnd(26)} ${project.tag}`,
        ),
      };
    case "skills":
      return {
        out: skillGroups.map(
          (group) => `  ${group.title.padEnd(16)} ${group.skills.join(", ")}`,
        ),
      };
    case "contact":
      return {
        out: [
          `  email     ${profile.email}`,
          `  github    ${profile.github}`,
          `  linkedin  ${profile.linkedin}`,
        ],
      };
    case "resume":
      window.open(profile.resumeUrl, "_blank", "noopener");
      return { out: ["opening resume…"] };
    case "theme": {
      if (arg === "list" || arg === "") {
        return {
          out: [
            `  dark   ${DARK_THEMES.join(", ")}`,
            `  light  ${LIGHT_THEMES.join(", ")}`,
            "",
            "usage: theme <name> · theme shuffle",
          ],
        };
      }
      if (arg === "shuffle") {
        return { out: [`theme → ${shuffleTheme()}`] };
      }
      return setThemeByName(arg)
        ? { out: [`theme → ${arg}`] }
        : { out: [`unknown theme: ${arg} — try \`theme list\``] };
    }
    case "mode":
      if (arg === "dark" || arg === "light") {
        setMode(arg);
        return { out: [`mode → ${arg}`] };
      }
      return { out: ["usage: mode dark · mode light"] };
    case "whoami":
      return { out: ["visitor — but you can fix that, run `contact`"] };
    case "ls":
      return { out: ["experience/  projects/  skills/  contact/  resume.pdf"] };
    case "pwd":
      return { out: ["/home/akshit/portfolio"] };
    case "sudo":
      return {
        out: [
          "visitor is not in the sudoers file.",
          "This incident will be reported to absolutely no one.",
        ],
      };
    case "hello":
    case "hi":
      return { out: ["hey there 👋"] };
    case "clear":
      return { out: [], action: "clear" };
    case "exit":
      return { out: [], action: "exit" };
    case "":
      return { out: [] };
    default:
      return { out: [`command not found: ${cmd} — try \`help\``] };
  }
}

const banner = (): Line[] => [
  { kind: "out", text: `Last login: ${new Date().toLocaleString()} on ttys001` },
  { kind: "out", text: "Welcome to iakshit.space 👋  Type `help` to look around." },
];

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => {
      setLines(banner());
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("terminal:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("terminal:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  if (!open) return null;

  const submit = () => {
    const input = value;
    setValue("");
    setHistoryIndex(-1);
    if (input.trim()) setHistory((h) => [...h, input]);

    const { out, action } = run(input);
    if (action === "clear") {
      setLines([]);
      return;
    }
    if (action === "exit") {
      setOpen(false);
      return;
    }
    setLines((prev) => [
      ...prev,
      { kind: "cmd", text: input },
      ...out.map((text): Line => ({ kind: "out", text })),
    ]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
    else if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const prefix = value.trimStart();
      if (!prefix || prefix.includes(" ")) return;
      const match = COMMANDS.find((c) => c.startsWith(prefix.toLowerCase()));
      if (match) setValue(match + " ");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-label="Interactive terminal"
        className="flex h-[26rem] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-edge bg-surface/95 font-mono text-sm shadow-2xl backdrop-blur-md"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.focus();
        }}
      >
        <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-[#28c840]" />
          <p className="flex-1 text-center text-xs text-muted">
            visitor@iakshit.space: ~
          </p>
        </div>
        <div ref={bodyRef} className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
          {lines.map((line, i) =>
            line.kind === "cmd" ? (
              <p key={i} className="text-foreground">
                <span className="text-accent">❯</span> {line.text}
              </p>
            ) : (
              <p key={i} className="whitespace-pre-wrap text-muted">
                {line.text}
              </p>
            ),
          )}
          <div className="flex items-center gap-2">
            <span className="text-accent">❯</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal command"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-foreground outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
