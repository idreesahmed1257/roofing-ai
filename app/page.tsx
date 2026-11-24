import Image from "next/image";
import HeroTalkButton from "@/components/HeroTalkButton";
import VoiceWidget from "@/components/VoiceWidget";
import {
  IconClock,
  IconCrew,
  IconGutter,
  IconInsulation,
  IconMaterial,
  IconRepair,
  IconRoof,
  IconShield,
  IconSiding,
  IconStorm,
} from "@/components/RoofIcons";

const services = [
  {
    title: "Roof replacement",
    detail: "Tear-offs and new systems in asphalt, metal, and tile.",
    Icon: IconRoof,
    tone: "teal",
  },
  {
    title: "Roof repair",
    detail: "Leaks, flashing, missing shingles — fixed before they spread.",
    Icon: IconRepair,
    tone: "copper",
  },
  {
    title: "Storm & hail",
    detail: "Impact checks, granule loss review, and a clear written plan.",
    Icon: IconStorm,
    tone: "slate",
  },
  {
    title: "Siding",
    detail: "Exterior refresh that lines up cleanly with roof edges.",
    Icon: IconSiding,
    tone: "teal",
  },
  {
    title: "Gutters & guards",
    detail: "New runs and guards that move water away from the home.",
    Icon: IconGutter,
    tone: "copper",
  },
  {
    title: "Attic insulation",
    detail: "Comfort upgrades that cut drafts and ice-dam risk.",
    Icon: IconInsulation,
    tone: "slate",
  },
];

const reasons = [
  {
    title: "Honest inspections",
    detail: "Repair when it fits. Replace only when the system is done.",
    Icon: IconShield,
  },
  {
    title: "Dedicated crews",
    detail: "Same team from setup through cleanup — no mystery subcontractors.",
    Icon: IconCrew,
  },
  {
    title: "Spec’d materials",
    detail: "Systems matched to pitch, climate, and how long you want them to last.",
    Icon: IconMaterial,
  },
  {
    title: "Storm-ready timing",
    detail: "Fast documentation after hail and wind so you know what to do next.",
    Icon: IconClock,
  },
];

const process = [
  {
    title: "Inspect",
    detail: "Roof, attic, and drainage walked together.",
  },
  {
    title: "Estimate",
    detail: "Options and scope in writing — no surprises.",
  },
  {
    title: "Install",
    detail: "Crews finish clean and walk the job with you.",
  },
];

const materials = [
  { name: "Architectural shingles", hint: "Most homes" },
  { name: "Standing seam metal", hint: "Long life" },
  { name: "Slate-look systems", hint: "Premium curb" },
  { name: "Low-slope membranes", hint: "Flat areas" },
  { name: "Ice & water barrier", hint: "Edge defense" },
  { name: "Ridge ventilation", hint: "Attic health" },
];

const stories = [
  {
    quote: "They didn’t push a full replacement after the hail. The plan was clear and fair.",
    name: "Jordan M.",
    note: "Storm inspection",
  },
  {
    quote: "One visit fixed a leak three other contractors kept missing. Site was spotless.",
    name: "Priya & Sam",
    note: "Leak repair",
  },
  {
    quote: "We chose metal for longevity. Install looked sharp and felt organized the whole week.",
    name: "Chris L.",
    note: "Metal replacement",
  },
];

export default function Home() {
  return (
    <div className="site">
      <div className="page-glow" aria-hidden="true" />

      <header className="nav">
        <a className="brand" href="#top">
          <span className="brand-mark" aria-hidden="true" />
          Ridgeform <span>Roofing</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#services">Services</a>
          <a href="#why">Why us</a>
          <a href="#process">Process</a>
          <a href="#stories">Reviews</a>
        </nav>
        <HeroTalkButton className="btn-nav" label="Free estimate" />
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-media" aria-hidden="true">
            <Image src="/download.webp" alt="" fill priority sizes="100vw" />
          </div>
          <div className="hero-grid">
            <div className="hero-content">
              <h1>Ridgeform Roofing</h1>
              <p>
                Careful inspections, honest recommendations, and exterior work
                built for real weather.
              </p>
              <div className="cta-row">
                <HeroTalkButton label="Get a free estimate" />
                <a className="btn-ghost" href="#services">
                  View services
                </a>
              </div>
            </div>

            <div className="hero-stat-stack" aria-label="Company highlights">
              <div className="hero-stat">
                <strong>30+</strong>
                <span>years protecting homes</span>
              </div>
              <div className="hero-stat">
                <strong>6</strong>
                <span>exterior service lines</span>
              </div>
              <div className="hero-stat">
                <strong>0</strong>
                <span>hard-sell estimates</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-services" id="services">
          <div className="section-head row-head">
            <div>
              <h2>Exterior services</h2>
              <p>Everything that keeps the envelope dry, finished, and storm-ready.</p>
            </div>
            <a className="text-link" href="#estimate">
              Book an inspection
            </a>
          </div>

          <div className="bento">
            {services.map((item, index) => {
              const Icon = item.Icon;
              return (
                <article
                  className={`bento-card tone-${item.tone}${index === 0 ? " is-feature" : ""}`}
                  key={item.title}
                >
                  <div className="icon-badge">
                    <Icon className="icon" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section section-feature" id="why">
          <div className="feature-split">
            <div className="feature-visual">
              <Image
                src="/download.webp"
                alt="Finished residential roof"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <div className="feature-visual-tag">
                <span>Job-site standard</span>
                <strong>Inspect · Spec · Install</strong>
              </div>
            </div>
            <div className="feature-copy">
              <h2>Built for homeowners, not pressure sales</h2>
              <p>
                A roof is one of the biggest decisions on a home. We document
                what we see, explain the options, and only recommend what the
                structure actually needs.
              </p>
              <div className="reason-list">
                {reasons.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <div className="reason-row" key={item.title}>
                      <div className="icon-badge compact">
                        <Icon className="icon" />
                      </div>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="section section-process" id="process">
          <div className="section-head center-head">
            <h2>From first look to finished ridge</h2>
            <p>Three clear steps. No mystery timeline.</p>
          </div>
          <div className="process-track">
            {process.map((step, index) => (
              <article className="process-node" key={step.title}>
                <div className="process-orb">{String(index + 1).padStart(2, "0")}</div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-materials" id="materials">
          <div className="materials-shell">
            <div className="materials-copy">
              <h2>Materials we install</h2>
              <p>
                Spec the right system for budget, look, and lifespan — then
                install it the way the manufacturer expects.
              </p>
            </div>
            <div className="material-grid">
              {materials.map((item) => (
                <div className="material-tile" key={item.name}>
                  <strong>{item.name}</strong>
                  <span>{item.hint}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-storm" id="storm">
          <div className="storm-banner">
            <div className="storm-copy">
              <div className="icon-badge large tone-copper-bg">
                <IconStorm className="icon" />
              </div>
              <h2>After a storm, start with clarity</h2>
              <p>
                Granules in the gutters or bruised shingles don’t automatically
                mean a full replacement. We inspect first.
              </p>
              <HeroTalkButton
                className="btn-primary btn-primary-solid"
                label="Request a storm inspection"
              />
            </div>
            <ul className="check-board">
              <li>Shingle bruising, lift, and missing tabs</li>
              <li>Granule loss around downspouts</li>
              <li>Flashing, valleys, penetrations</li>
              <li>Attic moisture or daylight gaps</li>
            </ul>
          </div>
        </section>

        <section className="section section-stories" id="stories">
          <div className="section-head">
            <h2>Homeowners who called Ridgeform</h2>
            <p>Short stories from inspection through finished work.</p>
          </div>
          <div className="story-rail">
            {stories.map((story) => (
              <blockquote className="story-card" key={story.name}>
                <div className="story-quote-mark" aria-hidden="true">
                  “
                </div>
                <p>{story.quote}</p>
                <footer>
                  <strong>{story.name}</strong>
                  <span>{story.note}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="section section-close" id="estimate">
          <div className="close-panel">
            <div className="close-copy">
              <h2>Ready for a no-pressure estimate?</h2>
              <p>
                Leaks, storm damage, or a roof that’s aging out — tell us what’s
                going on and we’ll schedule a consultation.
              </p>
            </div>
            <HeroTalkButton label="Get a free estimate" />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <a className="brand footer-logo" href="#top">
            <span className="brand-mark" aria-hidden="true" />
            Ridgeform <span>Roofing</span>
          </a>
          <p>Residential roofing, storm repair, siding, gutters, and insulation.</p>
        </div>
        <div className="footer-meta">
          <p>Mon–Fri 8AM–6PM · Sat 10AM–2PM</p>
          <p>Serving homeowners across the regional market</p>
        </div>
      </footer>

      <VoiceWidget />
    </div>
  );
}
