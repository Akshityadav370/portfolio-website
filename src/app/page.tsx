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
    </>
  );
}
