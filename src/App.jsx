import { useEffect, useRef, useState } from 'react';
import { Component } from './components/MusicReactiveHero';
import VantaBg from './components/VantaBg';
import './App.css';

// ── Custom Cursor ──
function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const raf     = useRef(null);
  const pos     = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const { clientX: mx, clientY: my } = e;
      pos.current.mx = mx; pos.current.my = my;
      if (dotRef.current)  { dotRef.current.style.left  = mx + 'px'; dotRef.current.style.top  = my + 'px'; }
      if (glowRef.current) { glowRef.current.style.left = mx + 'px'; glowRef.current.style.top = my + 'px'; }
    };
    window.addEventListener('mousemove', onMove);

    const animate = () => {
      raf.current = requestAnimationFrame(animate);
      const p = pos.current;
      p.rx += (p.mx - p.rx) * 0.12;
      p.ry += (p.my - p.ry) * 0.12;
      if (ringRef.current) { ringRef.current.style.left = p.rx + 'px'; ringRef.current.style.top = p.ry + 'px'; }
    };
    animate();

    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div ref={dotRef}  id="cursor" />
      <div ref={ringRef} id="cursor-ring" />
      <div ref={glowRef} id="glow" />
    </>
  );
}

// ── Nav ──
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <nav id="nav" className={scrolled ? 'scrolled' : ''}>
      <a href="#hero" className="nav-logo">Ahmad<span>.</span></a>
      <ul className="nav-links">
        <li><a href="#projects">Work</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#certs">Certs</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
      <a href="mailto:albtaynta48@gmail.com" className="nav-cta">Hire Me</a>
    </nav>
  );
}

// ── Reveal hook ──
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io  = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Certs with expandable images ──
const CERTS = [
  { name: 'HCIA-IoT V3.0',                              issuer: 'Huawei Technologies',                              badge: 'Certified',  img: '/certs/cert1.jpg' },
  { name: 'HCIA-openEuler V2.0',                        issuer: 'Huawei ICT Academy — May 2026',                    badge: 'Certified',  img: '/certs/cert2.jpg' },
  { name: 'Cloud Advanced: Architecture & Technologies', issuer: 'Huawei ICT Academy — May 2026',                    badge: 'Certified',  img: '/certs/cert3.jpg' },
  { name: 'Cyber Warriors CTF Training',                issuer: 'Cybersecurity — Attacker Mindset, CTF Challenges', badge: 'Completed',  img: '/certs/cert4.jpg' },
  { name: 'Raspberry Pi Workshop',                      issuer: 'Embedded Systems, GPIO, Hardware Prototyping',      badge: 'Completed',  img: '/certs/cert5.jpg' },
  { name: 'IEEE Member',                                issuer: 'Institute of Electrical and Electronics Engineers', badge: 'Active',     img: '/certs/cert6.jpg' },
];

function CertSection() {
  const [open, setOpen] = useState(null);
  const toggle = (name) => setOpen(prev => prev === name ? null : name);

  return (
    <section id="certs">
      <div className="section-inner">
        <div className="section-header reveal">
          <span className="section-num">03</span>
          <h2 className="section-title">Certifications</h2>
        </div>
        <div className="cert-list">
          {CERTS.map(c => (
            <div key={c.name}>
              <div
                className={`cert-row reveal cert-clickable${open === c.name ? ' cert-open' : ''}`}
                onClick={() => toggle(c.name)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && toggle(c.name)}
              >
                <div>
                  <p className="cert-name">{c.name}</p>
                  <p className="cert-issuer">{c.issuer}</p>
                </div>
                <div className="cert-row-right">
                  <span className="cert-badge">{c.badge}</span>
                  <span className={`cert-chevron${open === c.name ? ' rotated' : ''}`}>›</span>
                </div>
              </div>
              {/* Expandable image panel */}
              <div className={`cert-img-panel${open === c.name ? ' expanded' : ''}`}>
                <img src={c.img} alt={c.name} className="cert-img" loading="lazy" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main App ──
export default function App() {
  useReveal();

  return (
    <>
      <Cursor />
      <Nav />

      {/* ── HERO ── */}
      <Component />

      {/* ── EDU STRIP ── */}
      <div className="edu-strip reveal">
        <div className="edu-inner">
          <div className="edu-item"><span className="edu-value">2027</span><span className="edu-label">Expected Graduation</span></div>
          <div className="edu-divider" />
          <div className="edu-item"><span className="edu-value">25+</span><span className="edu-label">Games Built</span></div>
          <div className="edu-divider" />
          <div className="edu-item"><span className="edu-value">3×</span><span className="edu-label">Huawei Certified</span></div>
          <div className="edu-divider" />
          <div className="edu-item"><span className="edu-value">B.Sc.</span><span className="edu-label">IoT Engineering — BAU</span></div>
        </div>
      </div>

      {/* ─────────── VANTA SECTIONS WRAPPER ─────────── */}
      <div className="portfolio-3d-wrap">
        <VantaBg />

        {/* ── PROJECTS ── */}
        <section id="projects">
          <div className="section-inner">
            <div className="section-header reveal">
              <span className="section-num">01</span>
              <h2 className="section-title">Selected Work</h2>
            </div>
            <div className="projects-3d-list">
              {/* ZenithGames — featured */}
              <a className="proj3d-card reveal" href="https://zenithgames.me" target="_blank" rel="noopener">
                <div className="proj3d-num">001 <span>— Featured</span></div>
                <h3 className="proj3d-title">ZenithGames</h3>
                <p className="proj3d-desc">Production web platform hosting 25+ original games on a custom domain. Every game built from scratch in vanilla JavaScript — no engines, no templates.</p>
                <div className="proj3d-meta">
                  <div className="proj-tags">
                    <span className="tag featured">Live</span><span className="tag">React</span><span className="tag">JavaScript</span><span className="tag">HTML5</span>
                  </div>
                  <span className="proj3d-arrow">↗</span>
                </div>
              </a>

              <a className="proj3d-card reveal" href="https://github.com/iot-ahmad/smart-assistant-with-esp32" target="_blank" rel="noopener">
                <div className="proj3d-num">002</div>
                <h3 className="proj3d-title">ESP32 AI Voice Assistant</h3>
                <p className="proj3d-desc">Distributed architecture where the browser captures audio, a Python server processes it via LLaMA API, and the ESP32 outputs the response.</p>
                <div className="proj3d-meta">
                  <div className="proj-tags"><span className="tag">ESP32</span><span className="tag">Python</span><span className="tag">LLaMA API</span></div>
                  <span className="proj3d-arrow">↗</span>
                </div>
              </a>

              <a className="proj3d-card reveal" href="https://iot365.tech" target="_blank" rel="noopener">
                <div className="proj3d-num">003</div>
                <h3 className="proj3d-title">IOT365</h3>
                <p className="proj3d-desc">Smart IoT dashboard platform built with React + Firebase + Mosquitto MQTT on Oracle Cloud. Real-time device control, gauge widgets, terminal, NVIDIA Llama AI. JSYP 2026 hackathon.</p>
                <div className="proj3d-meta">
                  <div className="proj-tags"><span className="tag featured">Live</span><span className="tag featured">Hackathon</span><span className="tag">React</span><span className="tag">MQTT</span></div>
                  <span className="proj3d-arrow">↗</span>
                </div>
              </a>

              <div className="proj3d-card reveal">
                <div className="proj3d-num">004</div>
                <h3 className="proj3d-title">CNC Ink-Pen Plotter</h3>
                <p className="proj3d-desc">Co-built a functional CNC plotter translating digital vector designs into physical drawings using stepper motors on XY axes. Presented at BAU Science Day.</p>
                <div className="proj3d-meta">
                  <div className="proj-tags"><span className="tag">Hardware</span><span className="tag">Embedded C</span><span className="tag">Stepper Motors</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SKILLS ── */}
        <section id="skills">
          <div className="section-inner">
            <div className="section-header reveal"><span className="section-num">02</span><h2 className="section-title">Capabilities</h2></div>
            <div className="skills-layout">
              {[
                { title:'Front-End', items:['React.js','JavaScript ES6+','HTML5','CSS3','Responsive Design','Framer Motion','Tailwind CSS'] },
                { title:'IoT & Hardware', items:['ESP32','Raspberry Pi','Sensors & Actuators','Embedded Systems','MQTT','WebSockets'] },
                { title:'Back-End & Tools', items:['Python','REST APIs','LLaMA API','Firebase','Git & GitHub','Linux','Oracle Cloud'] },
                { title:'Security & Other', items:['CTF Challenges','Security-First Dev','openEuler OS','Cloud Architecture','Arabic (Native)','English'] },
              ].map(g => (
                <div className="skill-group reveal" key={g.title}>
                  <p className="skill-group-title">{g.title}</p>
                  <div className="skill-list">{g.items.map(i => <span className="skill-item" key={i}>{i}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CERTS ── */}
        <CertSection />

        {/* ── CONTACT ── */}
        <section id="contact">
          <div className="section-inner">
            <div className="section-header reveal"><span className="section-num">04</span><h2 className="section-title">Let's Build</h2></div>
            <div className="contact-cta reveal">
              <div className="filled">Open for</div>
              <div className="outline">Opportunities</div>
            </div>
            <div className="contact-links reveal">
              <a href="mailto:albtaynta48@gmail.com" className="contact-link primary">✉ albtaynta48@gmail.com</a>
              <a href="https://github.com/iot-ahmad" target="_blank" rel="noopener" className="contact-link">⌥ github.com/iot-ahmad</a>
              <a href="https://linkedin.com/in/ahmad-al-batayneh" target="_blank" rel="noopener" className="contact-link">↗ LinkedIn</a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer>
          <span className="footer-note">© 2026 Ahmad AL Batayneh — Amman, Jordan</span>
          <span className="footer-logo">Ahmad<span>.</span></span>
          <span className="footer-note">IoT Engineer & Front-End Developer</span>
        </footer>
      </div>{/* /portfolio-3d-wrap */}
    </>
  );
}

