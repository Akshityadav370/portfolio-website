import Link from "next/link";
import BackgroundFX from "@/components/BackgroundFX";
import ContactSection from "@/components/ContactSection";
import ExperienceSection from "@/components/ExperienceSection";
import Hero from "@/components/Hero";
import Nav from "@/components/Nav";
import PerfHud from "@/components/PerfHud";
import ProjectsSection from "@/components/ProjectsSection";
import SkillsSection from "@/components/SkillsSection";
import Terminal from "@/components/Terminal";

export default function Home() {
  return (
    <>
      <BackgroundFX />
      <Nav />
      <main>
        <Hero />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Terminal />
      <PerfHud />
      <Link
        href="/"
        prefetch={false}
        className="glass-chip fixed bottom-4 left-4 z-50 rounded-full border border-edge bg-surface/80 px-4 py-2 font-mono text-xs text-muted backdrop-blur-md transition-colors hover:text-accent"
      >
        3D world ↗
      </Link>
    </>
  );
}
