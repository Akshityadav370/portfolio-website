import WorldExperience from "@/components/world/WorldExperience";
export default function Home() {
  return (
    <>
      <WorldExperience />
      <noscript>
        <div className="world-nojs">
          <h1>Akshit Yadav — Software Engineer</h1>
          <p>The interactive world needs JavaScript.</p>
          <a href="/portfolio">Read the portfolio →</a>
        </div>
      </noscript>
    </>
  );
}
