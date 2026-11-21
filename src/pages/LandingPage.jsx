import React, { useState, useEffect } from 'react';
import {
  Leaf, ChevronRight, BarChart3, Truck, Factory, Package,
  Users, ShieldCheck, Star, ArrowRight, Play, CheckCircle,
  Thermometer, Activity, Award, Sparkles, Clock, MapPin, Sun, Moon
} from 'lucide-react';

export default function LandingPage({ onGetStarted, theme, onToggleTheme }) {
  // animate stats counting up when page loads
  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState({ batches: 0, suppliers: 0, accuracy: 0, estates: 0 });
  const [activeTab, setActiveTab] = useState('withering');

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { batches: 12903, suppliers: 847, accuracy: 98, estates: 14 };
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        batches: Math.floor(targets.batches * ease),
        suppliers: Math.floor(targets.suppliers * ease),
        accuracy: Math.floor(targets.accuracy * ease),
        estates: Math.floor(targets.estates * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  const features = [
    {
      icon: <Truck size={26} />,
      title: 'Leaf Collection & Routes',
      desc: 'Real-time green leaf intake, digital weighment slips, supplier balance syncing, and GPS transport routes.',
      color: '#10b981',
    },
    {
      icon: <Factory size={26} />,
      title: 'Smart Stage Monitoring',
      desc: 'Track Withering troughs, Rolling speeds, Aeration chamber humidity, and Fluid-Bed Drying temperatures.',
      color: '#3b82f6',
    },
    {
      icon: <Package size={26} />,
      title: 'Ceylon Tea Grading',
      desc: 'Automated grading for BOPF, BOP, OP & Dust grades with moisture limits, sieve analysis, and batch codes.',
      color: '#8b5cf6',
    },
    {
      icon: <BarChart3 size={26} />,
      title: 'Yield Analytics & Costing',
      desc: 'Instant outturn ratio calculations (Green Leaf to Made Tea %), daily auction rates, and cost per kilo reports.',
      color: '#f59e0b',
    },
    {
      icon: <Users size={26} />,
      title: 'Role-Based Team Portals',
      desc: 'Customized workflows for Factory Managers, Stage Officers, Grading Specialists, and Finance Teams.',
      color: '#ec4899',
    },
    {
      icon: <ShieldCheck size={26} />,
      title: 'Estate Traceability & Audit',
      desc: 'Complete farm-to-cup audit trails, ISO 22000 & HACCP quality checklists, and cryptographic tamper-proof records.',
      color: '#06b6d4',
    },
  ];

  const stages = {
    withering: {
      name: 'Withering',
      temp: '24.5 °C',
      moisture: '65% Target',
      duration: '14 - 18 hrs',
      desc: 'Trough air circulation to reduce moisture content from 75% down to 55-60%, making flushes pliable for rolling.'
    },
    rolling: {
      name: 'Rolling',
      temp: '22.0 °C',
      moisture: 'Cell Rupture',
      duration: '45 - 60 min',
      desc: 'Precision circular rollers twist the withered leaves to rupture cell walls and release natural enzymes for oxidation.'
    },
    aeration: {
      name: 'Aeration (Oxidation)',
      temp: '26.8 °C',
      moisture: '92% RH',
      duration: '90 - 120 min',
      desc: 'Controlled ambient humidity and oxygen exposure develops the characteristic coppery color and rich Ceylon aroma.'
    },
    drying: {
      name: 'Fluid-Bed Drying',
      temp: '110 °C',
      moisture: '2.5% Final',
      duration: '22 min',
      desc: 'Hot air currents arrest fermentation, locking in flavor compounds and bringing final moisture below 3% for storage.'
    },
  };

  const testimonials = [
    {
      name: 'Kamal Perera',
      role: 'Estate General Manager',
      estate: 'Nuwara Eliya High-Grown Estate',
      text: 'TeaSyncPro cut our paper logs by 85%. Being able to monitor trough temperatures and Made Tea outturn in real-time has elevated our export quality significantly.',
      stars: 5
    },
    {
      name: 'Malini Gunawardena',
      role: 'Chief Quality Officer',
      estate: 'Dimbula Valley Tea Co.',
      text: 'The automated Ceylon grading compliance and moisture tracking ensure our BOPF and OP batches meet international Colombo auction benchmarks every single time.',
      stars: 5
    },
    {
      name: 'Nimal Rajapaksa',
      role: 'Collection Superintendent',
      estate: 'Ruhuna Low-Grown Cooperative',
      text: 'Over 800 smallholders get instant weighment receipts. Dispute rates dropped to virtually zero within the first week of deployment.',
      stars: 5
    },
  ];

  return (
    <div className="landing-page">

      {/* ── STICKY NAV BAR ─────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">
            <Leaf size={22} color="white" strokeWidth={1.8} />
          </div>
          <span className="landing-nav-name">TeaSync<span>Pro</span></span>
        </div>
        <div className="landing-nav-links">
          <a href="#factory-preview">Factory Live</a>
          <a href="#quality">Purity &amp; Grading</a>
          <a href="#features">Features</a>
          <a href="#stats">Performance</a>
          <a href="#reviews">Testimonials</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="theme-toggle-landing-btn"
              title={theme === 'light' ? 'Switch to Dark Mode (🌙)' : 'Switch to Light Mode (☀️)'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'var(--slate-850)', border: '1px solid var(--card-border)',
                borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
                color: 'var(--slate-200)', fontSize: '0.82rem', fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {theme === 'light' ? (
                <>
                  <Moon size={16} style={{ color: '#64748b' }} />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun size={16} style={{ color: '#fbbf24' }} />
                  <span>Light</span>
                </>
              )}
            </button>
          )}
          <button className="landing-nav-btn" onClick={onGetStarted}>
            <span>Sign In</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION WITH REALISTIC TEA ESTATE IMAGERY ── */}
      <section className="landing-hero">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Next-Gen Ceylon Tea Manufacturing ERP</span>
          </div>

          <h1 className="hero-title">
            Intelligent Tea Factory Management<br />
            <span className="hero-title-highlight">From Tender Leaf to Premium Cup</span>
          </h1>

          <p className="hero-subtitle">
            Synchronize leaf weighbridge intake, multi-stage factory processing,
            Colombo auction grade sorting, and supplier disbursements with precision IoT analytics.
          </p>

          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={onGetStarted}>
              <span>Enter Portal</span>
              <ArrowRight size={18} />
            </button>
            <a href="#factory-preview" className="hero-btn-secondary">
              <Play size={15} />
              <span>Explore Factory Live</span>
            </a>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <CheckCircle size={15} color="#10b981" />
              <span>ISO 22000 &amp; HACCP Compliant</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle size={15} color="#10b981" />
              <span>Real-Time Sensor Telemetry</span>
            </div>
            <div className="hero-trust-item">
              <CheckCircle size={15} color="#10b981" />
              <span>Smallholder Weighment Sync</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Majestic Ceylon Tea Estate Banner with Live Widget Overlay */}
        <div className="hero-visual">
          <div className="hero-image-card">
            <div className="hero-image-wrapper">
              <img
                src="/images/tea_plantation_hero.jpg"
                alt="Ceylon Tea Estate Sunrise in Nuwara Eliya"
                className="hero-main-img"
              />
              <div className="hero-image-gradient" />

              {/* Top Floating Badge */}
              <div className="hero-floating-pill">
                <span className="hero-pulse-dot" />
                <MapPin size={13} color="#34d399" />
                <span>Nuwara Eliya Central Highlands · 1,890m</span>
              </div>

              {/* Bottom Floating Telemetry Card */}
              <div className="hero-floating-metrics">
                <div className="hero-metrics-header">
                  <div className="hero-metrics-title">
                    <Activity size={14} color="#10b981" />
                    <span>Live Factory Stream</span>
                  </div>
                  <span className="hero-metrics-status">Batch #TSP-942</span>
                </div>

                <div className="hero-metrics-grid">
                  <div className="hero-metric-box">
                    <span className="hero-metric-val">4,850 kg</span>
                    <span className="hero-metric-lbl">Daily Green Leaf Intake</span>
                  </div>
                  <div className="hero-metric-box">
                    <span className="hero-metric-val text-emerald">22.8%</span>
                    <span className="hero-metric-lbl">Expected Made Tea Outturn</span>
                  </div>
                </div>

                <div className="hero-stage-progress">
                  <div className="hero-progress-labels">
                    <span>Withering Trough #04</span>
                    <span className="text-emerald">64% Completed</span>
                  </div>
                  <div className="hero-progress-bar">
                    <div className="hero-progress-fill" style={{ width: '64%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ───────────────────────────── */}
      <section className="landing-stats" id="stats">
        {[
          { val: counts.batches.toLocaleString(), label: 'Batches Monitored', suffix: '+' },
          { val: counts.suppliers, label: 'Smallholder Suppliers', suffix: '+' },
          { val: counts.accuracy, label: 'Outturn Accuracy', suffix: '%' },
          { val: counts.estates, label: 'Regional Estates Connected', suffix: '' },
        ].map((s, i) => (
          <div className="landing-stat-card" key={i}>
            <div className="landing-stat-val">{s.val}{s.suffix}</div>
            <div className="landing-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── SMART FACTORY SHOWCASE SECTION ───────────── */}
      <section className="landing-factory-preview" id="factory-preview">
        <div className="section-header">
          <div className="section-badge">
            <Factory size={14} />
            <span>Industrial Processing Telemetry</span>
          </div>
          <h2 className="section-title">Inside the Smart Tea Factory</h2>
          <p className="section-sub">
            Monitor mechanical withering beds, automated rollers, aeration rooms, and continuous fluid dryers
            from a centralized control console.
          </p>
        </div>

        <div className="factory-preview-layout">
          {/* Main Visual: High-tech Factory Interior */}
          <div className="factory-image-container">
            <img
              src="/images/tea_factory_indoor.jpg"
              alt="TeaSyncPro Smart Factory Interior"
              className="factory-main-img"
            />
            <div className="factory-image-overlay" />

            {/* Overlay interactive stage chips */}
            <div className="factory-hud-badge top-left">
              <span className="hud-dot" />
              <span>Roller Line 03: 45 RPM • Active</span>
            </div>
            <div className="factory-hud-badge bottom-right">
              <Thermometer size={14} color="#f59e0b" />
              <span>Fluid Bed Dryer: 112 °C • Stable</span>
            </div>
          </div>

          {/* Side Stage Control Panel */}
          <div className="factory-stage-panel">
            <div className="stage-panel-header">
              <h3>Processing Stages</h3>
              <span className="stage-live-indicator">Real-Time Sync</span>
            </div>

            <div className="stage-tabs">
              {Object.entries(stages).map(([key, stg]) => (
                <div
                  key={key}
                  className={`stage-tab-card ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  <div className="stage-tab-top">
                    <span className="stage-tab-name">{stg.name}</span>
                    <span className="stage-tab-stat">{stg.temp}</span>
                  </div>
                  <p className="stage-tab-desc">{stg.desc}</p>
                  <div className="stage-tab-meta">
                    <span><Clock size={12} /> {stg.duration}</span>
                    <span><Activity size={12} /> {stg.moisture}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PURITY & CEYLON TEA GRADING SHOWCASE ──────── */}
      <section className="landing-quality-section" id="quality">
        <div className="section-header">
          <div className="section-badge">
            <Award size={14} />
            <span>Pure Ceylon Heritage</span>
          </div>
          <h2 className="section-title">From Fresh Leaf Harvest to Fine Cupping</h2>
          <p className="section-sub">
            Guaranteed authenticity, moisture control, and grade standard compliance for international export.
          </p>
        </div>

        <div className="quality-dual-grid">
          {/* Card 1: Fresh Green Leaves */}
          <div className="quality-card">
            <div className="quality-card-img-wrap">
              <img
                src="/images/fresh_tea_leaves.jpg"
                alt="Two leaves and a bud Ceylon tea shoot"
                className="quality-card-img"
              />
              <span className="quality-card-tag">Strict Quality Check</span>
            </div>
            <div className="quality-card-content">
              <h3>Two Leaves &amp; a Bud Intake</h3>
              <p>
                Optical leaf counters and weighing sensors verify harvest freshness,
                moisture deducts, and coarse leaf percentage right at the collection gate.
              </p>
              <div className="quality-checklist">
                <div className="qc-item"><CheckCircle size={14} color="#10b981" /> 75% Leaf Maturity Acceptance</div>
                <div className="qc-item"><CheckCircle size={14} color="#10b981" /> Automated Water Weight Deductions</div>
                <div className="qc-item"><CheckCircle size={14} color="#10b981" /> Supplier Route Bag Tagging</div>
              </div>
            </div>
          </div>

          {/* Card 2: Tea Cup & Grading */}
          <div className="quality-card">
            <div className="quality-card-img-wrap">
              <img
                src="/images/tea_cup_grading.jpg"
                alt="Ceylon tea liquor tasting and dry leaf grades"
                className="quality-card-img"
              />
              <span className="quality-card-tag amber">Export Cupping Standards</span>
            </div>
            <div className="quality-card-content">
              <h3>Colombo Auction Tea Grading</h3>
              <p>
                Classify output batches into premium BOPF, BOP, Pekoe, and Dust grades with
                density measurement, tasting liquor scores, and export compliance barcodes.
              </p>
              <div className="quality-badges-row">
                <span className="grade-badge">BOPF · High Grown</span>
                <span className="grade-badge">BOP · Broken Orange</span>
                <span className="grade-badge">OP · Orange Pekoe</span>
                <span className="grade-badge">Dust 1 · Fast Brew</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE FEATURES GRID ────────────────────────── */}
      <section className="landing-features" id="features">
        <div className="section-header">
          <div className="section-badge">Platform Capabilities</div>
          <h2 className="section-title">Built for Real Sri Lankan Factory Workflows</h2>
          <p className="section-sub">
            Designed ground-up to handle the exact challenges of tea estates, smallholder collectors, and manufacturing officers.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon" style={{ background: f.color + '1a', color: f.color }}>
                {f.icon}
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────── */}
      <section className="landing-testimonials" id="reviews">
        <div className="section-header">
          <div className="section-badge">Verified Estate Officers</div>
          <h2 className="section-title">Trusted by Leading Tea Producers</h2>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <div className="testimonial-stars">
                {Array(t.stars).fill(0).map((_, j) => (
                  <Star key={j} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                  <div className="testimonial-estate">{t.estate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION WITH BACKGROUND GLOW ──────── */}
      <section className="landing-cta">
        <div className="cta-backdrop-image" />
        <div className="cta-content">
          <div className="cta-icon-wrap">
            <Leaf size={32} color="#10b981" />
          </div>
          <h2 className="cta-title">
            Empower Your Tea Factory With<br />
            Next-Gen Precision
          </h2>
          <p className="cta-sub">
            Access your department console, inspect live batches, and track leaf arrivals right away.
          </p>
          <button className="hero-btn-primary cta-btn" onClick={onGetStarted}>
            <span>Sign In to TeaSyncPro Portal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-top">
          <div className="landing-footer-brand">
            <div className="landing-nav-logo" style={{ width: '32px', height: '32px' }}>
              <Leaf size={18} color="white" strokeWidth={1.8} />
            </div>
            <span className="landing-nav-name" style={{ fontSize: '1.15rem' }}>TeaSync<span>Pro</span></span>
          </div>
          <div className="landing-footer-links">
            <a href="#factory-preview">Factory Live</a>
            <a href="#quality">Grading Standards</a>
            <a href="#features">Features</a>
            <a href="#reviews">Testimonials</a>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p className="landing-footer-copy">
            © 2026 TeaSyncPro · Ceylon Tea Factory &amp; Estate Management System · All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
