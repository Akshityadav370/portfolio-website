import Reveal from "@/components/Reveal";

export default function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <Reveal>
        <p className="font-mono text-sm text-accent">{eyebrow}</p>
        <h2 className="mt-2 w-fit text-3xl font-semibold tracking-tight sm:text-4xl">
          <span className="text-gradient">{title}</span>
        </h2>
      </Reveal>
      <div className="mt-10">{children}</div>
    </section>
  );
}
