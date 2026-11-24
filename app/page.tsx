import Image from "next/image";
import HeroTalkButton from "@/components/HeroTalkButton";
import VoiceWidget from "@/components/VoiceWidget";

const services = [
  "Roof replacement",
  "Roof repair",
  "Storm & hail",
  "Siding",
  "Gutters",
  "Insulation",
];

export default function Home() {
  return (
    <div className="site">

      <header className="nav">
        <div className="brand">
          Schoenherr <span>Roofing</span>
        </div>
        <div className="nav-meta">SE Michigan · EST. 1995</div>
      </header>

      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <Image
            src="/download.webp"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-content">
          <h1>Schoenherr Roofing</h1>
          <p>
            Faithfully protecting Michigan homes for over 30 years. Talk to our
            AI sales agent now — get storm guidance, service answers, and book
            a no-pressure estimate.
          </p>
          <div className="cta-row">
            <HeroTalkButton />
            <a className="btn-ghost" href="tel:2484222910">
              Call Romeo (248) 422-2910
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <h2>Exterior services</h2>
        <p>
          Roofing, storm recovery, siding, gutters, and insulation — with a
          consultative, no-pressure approach.
        </p>
        <ul className="services">
          {services.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="section" id="talk">
        <h2>AI voice sales agent</h2>
        <p>
          Ask about hail damage, granule loss, materials, hours, or schedule an
          inspection. The sales agent searches our roofing knowledge and can take
          your estimate request.
        </p>
        <p style={{ color: "rgba(0,0,0,0.55)", fontSize: "0.95rem" }}>
          Tip for the pitch: “Yesterday there was a hailstorm and I found
          pebbles from my roof by the gutters — what do you suggest?”
        </p>
      </section>

      <footer className="footer">
        <strong>Schoenherr Roofing</strong>
        <div>
          Romeo · Novi · Grand Rapids · Rochester · Sterling Heights
          <br />
          Mon–Tue 8–7 · Wed–Thu 8–6 · Fri 8–5 · Sat 10–2
        </div>
        <div>Demo site for AI voice sales automation — not the live production site.</div>
      </footer>

      <VoiceWidget />
    </div>
  );
}
