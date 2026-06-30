import { useState, useEffect, useRef } from "react";

/* ─── FONTS via @import ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #080808;
      --s1: #0f0f0f;
      --s2: #141414;
      --s3: #1a1a1a;
      --b: rgba(255,255,255,0.07);
      --bs: rgba(255,255,255,0.11);
      --bf: rgba(255,255,255,0.28);
      --t: #efefef;
      --tm: #6b6b6b;
      --td: #383838;
      --green: #22c55e;
      --gd: rgba(34,197,94,0.12);
      --gs: 0 0 0 1px rgba(34,197,94,0.3);
    }

    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--t);
      font-family: 'DM Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    ::selection { background: rgba(255,255,255,0.15); }

    /* scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--bs); border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(28px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes popIn {
      from { opacity:0; transform:scale(0.88); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
    @keyframes drift {
      0%,100% { transform: translate(0,0) rotate(0deg); }
      33%      { transform: translate(30px,-20px) rotate(3deg); }
      66%      { transform: translate(-20px,15px) rotate(-2deg); }
    }
    @keyframes slideDown {
      from { opacity:0; transform:translateY(-8px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes stepFade {
      from { opacity:0; transform:translateX(16px); }
      to   { opacity:1; transform:translateX(0); }
    }

    .fade-up { animation: fadeUp .65s ease both; }
    .d1 { animation-delay:.08s }
    .d2 { animation-delay:.18s }
    .d3 { animation-delay:.30s }
    .d4 { animation-delay:.44s }

    .hover-lift { transition: transform .2s ease, box-shadow .2s ease; }
    .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,.5); }
  `}</style>
);

/* ─── UTILS ─── */
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); }}, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? undefined : 0, animation: visible ? `fadeUp .65s ${delay}s ease both` : "none" }} className={className}>
      {children}
    </div>
  );
};

/* ─── NAV ─── */
const Nav = ({ page, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <>
      <style>{`
        .nav {
          position: fixed; top:0; left:0; right:0; z-index:200;
          height:56px; display:flex; align-items:center;
          transition: background .3s, border-color .3s;
          border-bottom: 1px solid ${scrolled ? "var(--b)" : "transparent"};
          background: ${scrolled ? "rgba(8,8,8,.92)" : "transparent"};
          backdrop-filter: ${scrolled ? "blur(18px)" : "none"};
        }
        .nav-in { max-width:1300px; margin:0 auto; padding:0 32px; width:100%; display:flex; align-items:center; justify-content:space-between; }
        .logo { display:flex; align-items:center; gap:9px; text-decoration:none; color:var(--t); cursor:pointer; }
        .logo-sq { width:28px; height:28px; background:white; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .logo-sq svg { width:15px; height:15px; }
        .logo-name { font-weight:600; font-size:15.5px; letter-spacing:-.02em; }
        .nav-links { display:flex; align-items:center; gap:2px; }
        .nav-links a { color:var(--tm); text-decoration:none; font-size:14px; padding:5px 13px; border-radius:6px; transition:color .15s, background .15s; }
        .nav-links a:hover { color:var(--t); background:rgba(255,255,255,.05); }
        .nav-acts { display:flex; gap:8px; align-items:center; }
        .btn-ghost { background:none; border:1px solid transparent; color:var(--tm); padding:6px 15px; border-radius:7px; font-size:13.5px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:color .15s; }
        .btn-ghost:hover { color:var(--t); }
        .btn-white { background:white; color:black; border:none; padding:7px 16px; border-radius:8px; font-size:13.5px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:opacity .15s, transform .15s; }
        .btn-white:hover { opacity:.88; transform:translateY(-1px); }
        .mobile-toggle { display:none; background:none; border:none; color:var(--tm); cursor:pointer; padding:4px; }
        .mobile-menu { display:none; position:fixed; top:56px; left:0; right:0; background:rgba(8,8,8,.97); border-bottom:1px solid var(--b); padding:16px 24px 24px; backdrop-filter:blur(20px); animation:slideDown .2s ease; z-index:199; }
        .mobile-menu a { display:block; padding:12px 0; color:var(--tm); text-decoration:none; font-size:15px; border-bottom:1px solid var(--b); }
        .mobile-menu a:last-child { border-bottom:none; }
        @media(max-width:860px){
          .nav-links { display:none; }
          .nav-acts .btn-ghost { display:none; }
          .mobile-toggle { display:block; }
          .mobile-menu.open { display:block; }
        }
      `}</style>
      <nav className="nav">
        <div className="nav-in">
          <div className="logo" onClick={() => { setPage("home"); window.scrollTo(0,0); }}>
            <div className="logo-sq">
              <svg viewBox="0 0 15 15" fill="none">
                <rect x="1" y="1" width="5.5" height="5.5" fill="black" rx="1"/>
                <rect x="8.5" y="1" width="5.5" height="5.5" fill="black" rx="1"/>
                <rect x="1" y="8.5" width="5.5" height="5.5" fill="black" rx="1"/>
                <rect x="8.5" y="8.5" width="5.5" height="5.5" fill="black" rx="1"/>
              </svg>
            </div>
            <span className="logo-name">StrategyAI</span>
          </div>

          <nav className="nav-links">
            {links.map(l => (
              <a key={l.label} href={l.href} onClick={(e) => { if (page !== "home") { e.preventDefault(); setPage("home"); setTimeout(() => { document.querySelector(l.href)?.scrollIntoView({behavior:"smooth"}); }, 100); }}}>{l.label}</a>
            ))}
          </nav>

          <div className="nav-acts">
            <button className="btn-ghost">Log In</button>
            <button className="btn-white" onClick={() => setPage("questionnaire")}>Get Started</button>
            <button className="mobile-toggle" onClick={() => setMobileOpen(o => !o)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d={mobileOpen ? "M4 4l12 12M4 16L16 4" : "M3 5h14M3 10h14M3 15h14"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </nav>
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {links.map(l => (
          <a key={l.label} href={l.href} onClick={() => { setMobileOpen(false); if (page !== "home") setPage("home"); }}>{l.label}</a>
        ))}
        <button style={{marginTop:16,width:"100%",padding:"12px",background:"white",color:"black",border:"none",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontWeight:500,fontSize:14,cursor:"pointer"}} onClick={() => { setMobileOpen(false); setPage("questionnaire"); }}>Get Started →</button>
      </div>
    </>
  );
};

/* ─── HERO ─── */
const Hero = ({ setPage }) => (
  <section style={{minHeight:"100vh",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",padding:"100px 0 80px"}}>
    <style>{`
      .hero-bg { position:absolute; inset:0; background:
        radial-gradient(ellipse 70% 55% at 105% 85%, rgba(34,197,94,.055) 0%, transparent 60%),
        radial-gradient(ellipse 50% 45% at -5% 50%, rgba(255,255,255,.025) 0%, transparent 55%); }
      .hero-grid { position:absolute; inset:0;
        background-image: linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
        background-size:64px 64px;
        mask-image:radial-gradient(ellipse 90% 90% at 50% 50%, black 35%, transparent 100%); }
      .orb { position:absolute; border-radius:50%; animation:drift 18s ease-in-out infinite; pointer-events:none; }
      .hero-inner { max-width:1300px; margin:0 auto; padding:0 32px; position:relative; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
      .hero-badge { display:inline-flex; align-items:center; gap:8px; padding:5px 13px; border:1px solid var(--bs); border-radius:100px; font-size:12px; color:var(--tm); font-family:'DM Mono',monospace; margin-bottom:36px; background:rgba(255,255,255,.03); }
      .live-dot { width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 8px var(--green); animation:pulse 2s ease-in-out infinite; }
      .hero h1 { font-family:'EB Garamond',serif; font-size:clamp(54px,6.5vw,90px); font-weight:400; line-height:1.04; letter-spacing:-.025em; margin-bottom:28px; }
      .hero h1 em { font-style:italic; color:rgba(239,239,239,.42); }
      .hero-sub { font-size:16px; color:var(--tm); line-height:1.75; max-width:460px; margin-bottom:44px; }
      .hero-btns { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
      .hero-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--b); border:1px solid var(--b); border-radius:12px; overflow:hidden; margin-top:52px; }
      .hero-stat { background:var(--s1); padding:20px; }
      .hero-stat .val { font-family:'EB Garamond',serif; font-size:32px; color:var(--t); }
      .hero-stat .lbl { font-size:12px; color:var(--tm); margin-top:3px; }
      .hero-visual { position:relative; }
      .card-stack { position:relative; }
      .dash-card { background:var(--s1); border:1px solid var(--bs); border-radius:14px; padding:24px; position:absolute; }
      .dc-main { position:relative; width:100%; padding:28px; }
      .dc-float1 { width:220px; top:-28px; right:-32px; animation:drift 12s ease-in-out infinite; }
      .dc-float2 { width:200px; bottom:-36px; left:-24px; animation:drift 16s ease-in-out 3s infinite; }
      @media(max-width:900px){
        .hero-inner { grid-template-columns:1fr; gap:48px; }
        .hero-visual { display:none; }
        .hero-stats { grid-template-columns:repeat(3,1fr); }
      }
    `}</style>

    <div className="hero-bg"/>
    <div className="hero-grid"/>
    <div className="orb" style={{width:400,height:400,background:"radial-gradient(circle,rgba(34,197,94,.04),transparent 70%)",top:"10%",right:"5%"}}/>
    <div className="orb" style={{width:300,height:300,background:"radial-gradient(circle,rgba(255,255,255,.02),transparent 70%)",bottom:"15%",left:"10%",animationDelay:"6s"}}/>

    <div className="hero-inner">
      <div>
        <div className="hero-badge fade-up">
          <span className="live-dot"/>
          Now with competitor benchmarking
        </div>
        <h1 className="hero h1 fade-up d1">
          Marketing <em>for</em><br/>
          founders
        </h1>
        <p className="hero-sub fade-up d2">
          The best way to reach growth instead of guessing. Deliver tailored marketing strategies and 90-day roadmaps — expert-reviewed, affordable.
        </p>
        <div className="hero-btns fade-up d3">
          <button onClick={() => setPage("questionnaire")} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 24px",background:"white",color:"black",border:"none",borderRadius:9,fontSize:14,fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"opacity .15s, transform .15s"}}
            onMouseEnter={e=>{e.target.style.opacity=".86";e.target.style.transform="translateY(-2px)"}}
            onMouseLeave={e=>{e.target.style.opacity="1";e.target.style.transform="translateY(0)"}}>
            Get Started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <a href="#how-it-works" style={{color:"var(--tm)",fontSize:14,textDecoration:"none",display:"flex",alignItems:"center",gap:6,transition:"color .15s"}}
            onMouseEnter={e=>e.target.style.color="var(--t)"}
            onMouseLeave={e=>e.target.style.color="var(--tm)"}>
            How it works →
          </a>
        </div>

        <div className="hero-stats fade-up d4">
          {[["100+","Strategies delivered"],["£99","One-time price"],["4.9★","Average rating"]].map(([v,l]) => (
            <div key={l} className="hero-stat">
              <div className="val">{v}</div>
              <div className="lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        <div className="card-stack">
          {/* Main card */}
          <div className="dash-card dc-main">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <div style={{width:36,height:36,background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.25)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>📊</div>
              <div>
                <div style={{fontSize:11,color:"var(--td)",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Strategy Status</div>
                <div style={{fontSize:14,fontWeight:500}}>Q4 2025 Plan</div>
              </div>
              <div style={{marginLeft:"auto",background:"var(--gd)",border:"1px solid rgba(34,197,94,.25)",borderRadius:20,padding:"3px 10px",fontSize:11,color:"var(--green)"}}>In Review</div>
            </div>
            {[["Target Audience","SMB Founders, 30–50"],["Primary Channel","LinkedIn + Content"],["Monthly Budget","£1,500 – £5,000"],["Timeframe","90-day roadmap"]].map(([k,v]) => (
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--b)"}}>
                <span style={{fontSize:13,color:"var(--tm)"}}>{k}</span>
                <span style={{fontSize:13,color:"var(--t)",fontWeight:500}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:18,padding:"14px",background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.15)",borderRadius:8}}>
              <div style={{fontSize:11,color:"var(--green)",fontFamily:"'DM Mono',monospace",marginBottom:4}}>DELIVERABILITY</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:40,lineHeight:1,marginBottom:8}}>98%</div>
              <div style={{display:"flex",gap:16}}>
                {[["✓ Delivered","3,204"],["✗ Bounced","60"]].map(([l,v])=>(
                  <div key={l}><div style={{fontSize:11,color:"var(--tm)"}}>{l}</div><div style={{fontSize:13,fontWeight:600,color:"var(--t)"}}>{v}</div></div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating card 1 */}
          <div className="dash-card dc-float1" style={{boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
            <div style={{fontSize:11,color:"var(--td)",fontFamily:"'DM Mono',monospace",marginBottom:8}}>ENGAGEMENT</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:34,lineHeight:1,marginBottom:10}}>41%</div>
            {[["● Opened","1,314"],["● Clicked","496"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0",color:"var(--tm)"}}>
                <span>{l}</span><span style={{color:"var(--t)"}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Floating card 2 */}
          <div className="dash-card dc-float2" style={{boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
            <div style={{fontSize:11,color:"var(--td)",fontFamily:"'DM Mono',monospace",marginBottom:6}}>AUDIENCE</div>
            <div style={{fontSize:14,fontWeight:500,marginBottom:10}}>Newsletter subscribers</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Contacts","1,034"],["Active","97%"]].map(([l,v])=>(
                <div key={l} style={{background:"rgba(255,255,255,.03)",border:"1px solid var(--b)",borderRadius:6,padding:8}}>
                  <div style={{fontSize:10,color:"var(--td)",textTransform:"uppercase"}}>{l}</div>
                  <div style={{fontSize:15,fontWeight:500,marginTop:2}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── FEATURES ─── */
const Features = () => {
  const items = [
    { icon:"🧠", title:"AI-Powered Analysis", desc:"Our advanced AI analyzes your business model, industry landscape, and competitive environment to craft a strategy that's genuinely yours — not a generic template." },
    { icon:"📄", title:"Comprehensive PDF Report", desc:"SWOT analysis, target audience profiles, channel recommendations, budget allocation, and a 90-day implementation roadmap — all in one polished PDF." },
    { icon:"👤", title:"Expert Refinement", desc:"Every strategy is personally reviewed and refined by Marta Belya, ensuring your plan is deeply aligned with real-world market conditions." },
    { icon:"⚡", title:"5–7 Day Delivery", desc:"Skip the months of research and agency proposals. Your custom marketing strategy lands in your inbox in under a week." },
    { icon:"💷", title:"£99, Not £2,500", desc:"Traditional agencies charge £500–£2,500 for strategy work. We believe great strategy should be accessible to every business at any stage." },
    { icon:"🔒", title:"Fully Secure", desc:"Your business data is encrypted and never shared with third parties. We treat your information with the same discretion you do." },
  ];

  return (
    <section id="features" style={{padding:"104px 0",borderTop:"1px solid var(--b)"}}>
      <style>{`
        .feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--b); border:1px solid var(--b); border-radius:16px; overflow:hidden; }
        .feat-card { background:var(--s1); padding:40px; transition:background .2s; }
        .feat-card:hover { background:var(--s2); }
        .feat-icon { width:42px; height:42px; border-radius:10px; background:rgba(255,255,255,.05); border:1px solid var(--bs); display:flex; align-items:center; justify-content:center; margin-bottom:20px; font-size:19px; }
        .feat-card h3 { font-size:15px; font-weight:500; margin-bottom:10px; }
        .feat-card p { font-size:13.5px; color:var(--tm); line-height:1.68; }
        @media(max-width:860px){ .feat-grid{grid-template-columns:1fr 1fr;} }
        @media(max-width:560px){ .feat-grid{grid-template-columns:1fr;} }
      `}</style>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
        <Reveal><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:18}}>Why StrategyAI</div></Reveal>
        <Reveal delay={0.05}><h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(36px,4vw,58px)",fontWeight:400,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:14}}>Built for clarity,<br/><em style={{fontStyle:"italic",color:"rgba(239,239,239,.4)"}}>not complexity</em></h2></Reveal>
        <Reveal delay={0.1}><p style={{fontSize:16,color:"var(--tm)",maxWidth:520,lineHeight:1.72,marginBottom:56}}>Stop wasting budget on guesswork. Our AI engine analyzes your business and delivers a comprehensive strategy within days.</p></Reveal>
        <div className="feat-grid">
          {items.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04}>
              <div className="feat-card">
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── ANALYTICS / GO BEYOND ─── */
const Analytics = () => (
  <section style={{padding:"104px 0",background:"var(--s1)",borderTop:"1px solid var(--b)",borderBottom:"1px solid var(--b)"}}>
    <style>{`
      .an-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:64px; }
      .an-card { background:var(--s2); border:1px solid var(--bs); border-radius:14px; overflow:hidden; }
      .an-preview { padding:28px; min-height:220px; position:relative; overflow:hidden; }
      .an-info { padding:28px; border-top:1px solid var(--b); }
      .an-info h3 { font-size:15px; font-weight:500; margin-bottom:8px; }
      .an-info p { font-size:13px; color:var(--tm); line-height:1.65; margin-bottom:12px; }
      .lm { font-size:13px; color:var(--tm); cursor:pointer; transition:color .15s; }
      .lm:hover { color:var(--t); }
      .mock-box { background:rgba(255,255,255,.04); border:1px solid var(--bs); border-radius:10px; padding:16px; }
      .bar-row { display:flex; align-items:flex-end; gap:3px; height:32px; }
      .bar-seg { flex:1; background:var(--green); border-radius:2px; opacity:.55; }
      @media(max-width:760px){ .an-grid{grid-template-columns:1fr;} }
    `}</style>
    <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
      <Reveal><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:18}}>Insight & Analytics</div></Reveal>
      <Reveal delay={0.05}><h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(36px,4vw,58px)",fontWeight:400,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:14}}>Go beyond <em style={{fontStyle:"italic",color:"rgba(239,239,239,.4)"}}>guessing</em></h2></Reveal>
      <Reveal delay={0.1}><p style={{fontSize:16,color:"var(--tm)",maxWidth:520,lineHeight:1.72}}>Group and control your strategy inputs in a simple way. Straightforward analytics and reporting tools that help you market smarter.</p></Reveal>

      <div className="an-grid">
        <Reveal delay={0.05}>
          <div className="an-card">
            <div className="an-preview">
              <div className="mock-box">
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{width:36,height:36,background:"var(--gd)",border:"1px solid rgba(34,197,94,.2)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>👥</div>
                  <div>
                    <div style={{fontSize:11,color:"var(--td)"}}>Audience</div>
                    <div style={{fontSize:14,fontWeight:500}}>Newsletter subscribers ▾</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[["ALL CONTACTS","1,034"],["UNSUBSCRIBED","5"],["GROWTH","↑ 12%"]].map(([l,v])=>(
                    <div key={l} style={{background:"rgba(255,255,255,.03)",border:"1px solid var(--b)",borderRadius:6,padding:10}}>
                      <div style={{fontSize:10,color:"var(--td)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{l}</div>
                      <div style={{fontSize:15,fontWeight:500,marginTop:2}}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12}}>
                  <div className="bar-row">
                    {[35,50,42,68,75,58,82,91,88,100].map((h,i)=>(
                      <div key={i} className="bar-seg" style={{height:`${h}%`}}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="an-info">
              <div style={{fontSize:20,marginBottom:10}}>👥</div>
              <h3>Audience Management</h3>
              <p>Import your list in minutes, regardless of size. Get full visibility of each contact and their personal attributes.</p>
              <span className="lm">Learn more →</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="an-card">
            <div className="an-preview">
              <div className="mock-box">
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",top:-10,right:-10,width:110,height:110,background:"radial-gradient(circle,rgba(34,197,94,.3),transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
                  <div style={{fontSize:10,color:"var(--td)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Deliverability</div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:48,lineHeight:1,marginBottom:14}}>98%</div>
                  {[["●","var(--green)","Delivered","3,204"],["●","#ef4444","Bounced","60"]].map(([dot,c,l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--b)"}}>
                      <span style={{fontSize:13,color:"var(--tm)"}}><span style={{color:c}}>{dot}</span> {l}</span>
                      <span style={{fontSize:13,fontWeight:600}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,padding:12,background:"rgba(255,255,255,.03)",border:"1px solid var(--b)",borderRadius:8}}>
                  <div style={{fontSize:10,color:"var(--td)",textTransform:"uppercase",marginBottom:4}}>Engagement</div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:32,lineHeight:1,marginBottom:8}}>41%</div>
                  {[["Opened"],["Clicked"]].map(([l])=>(
                    <div key={l} style={{fontSize:12,color:"var(--tm)",padding:"3px 0"}}><span style={{color:"#60a5fa"}}>●</span> {l}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="an-info">
              <div style={{fontSize:20,marginBottom:10}}>📊</div>
              <h3>Broadcast Analytics</h3>
              <p>Unlock powerful insights and understand exactly how your audience is interacting with your broadcast strategy.</p>
              <span className="lm">Learn more →</span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ─── HOW IT WORKS ─── */
const HowItWorks = () => {
  const steps = [
    { n:"01", icon:"✉️", title:"Answer questions", desc:"Tell us about your business, goals, target audience, and current marketing efforts through our smart 5-minute questionnaire. No fluff — just the signal we need." },
    { n:"02", icon:"🧠", title:"AI analyzes & builds", desc:"Our advanced AI processes your responses alongside industry data and competitor benchmarks to generate a comprehensive marketing strategy — uniquely yours." },
    { n:"03", icon:"📬", title:"Expert review & delivery", desc:"Marta personally reviews and refines the strategy before it's delivered as a polished PDF report to your inbox within 5–7 days. Done." },
  ];
  return (
    <section id="how-it-works" style={{padding:"104px 0",borderTop:"1px solid var(--b)"}}>
      <style>{`
        .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--b); border:1px solid var(--b); border-radius:16px; overflow:hidden; margin-top:64px; }
        .step-card { background:var(--s1); padding:40px; transition:background .2s; }
        .step-card:hover { background:var(--s2); }
        .step-n { font-family:'DM Mono',monospace; font-size:11px; color:var(--td); margin-bottom:20px; }
        .step-icon-lg { font-size:26px; margin-bottom:16px; display:block; }
        .step-card h3 { font-size:17px; font-weight:500; margin-bottom:10px; }
        .step-card p { font-size:13.5px; color:var(--tm); line-height:1.68; }
        @media(max-width:700px){ .steps-grid{grid-template-columns:1fr;} }
      `}</style>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
        <Reveal><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:18}}>Simple Process</div></Reveal>
        <Reveal delay={0.05}><h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(36px,4vw,58px)",fontWeight:400,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:14}}>Three steps to<br/><em style={{fontStyle:"italic",color:"rgba(239,239,239,.4)"}}>your strategy</em></h2></Reveal>
        <Reveal delay={0.1}><p style={{fontSize:16,color:"var(--tm)",maxWidth:480,lineHeight:1.72,marginBottom:0}}>Get your custom marketing strategy in days — not weeks. No lengthy calls, no complicated onboarding.</p></Reveal>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="step-card">
                <div className="step-n">{s.n}</div>
                <span className="step-icon-lg">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <div style={{marginTop:40,display:"flex",justifyContent:"center"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 18px",background:"rgba(255,255,255,.03)",border:"1px solid var(--b)",borderRadius:100,fontFamily:"'DM Mono',monospace",fontSize:12,color:"var(--tm)"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 8px var(--green)",animation:"pulse 2s ease-in-out infinite",display:"inline-block"}}/>
              Average completion time: 5–7 business days
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─── MARTA BIO ─── */
const About = () => (
  <section id="about" style={{padding:"104px 0",background:"var(--s1)",borderTop:"1px solid var(--b)",borderBottom:"1px solid var(--b)"}}>
    <style>{`
      .about-grid { display:grid; grid-template-columns:1fr 1.4fr; gap:72px; align-items:start; margin-top:64px; }
      .about-img-wrap { position:relative; }
      .about-img { width:100%; aspect-ratio:4/5; border-radius:14px; overflow:hidden; background:var(--s2); border:1px solid var(--bs); position:relative; }
      .about-img img { width:100%; height:100%; object-fit:cover; filter:grayscale(20%); }
      .about-img::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(8,8,8,.4) 0%, transparent 50%); }
      .stats-row { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--b); border:1px solid var(--b); border-radius:10px; overflow:hidden; margin-top:16px; }
      .stat-c { background:var(--s1); padding:16px; text-align:center; }
      .stat-c .sv { font-family:'EB Garamond',serif; font-size:26px; color:var(--t); }
      .stat-c .sl { font-size:11px; color:var(--tm); margin-top:2px; }
      .about-body { }
      .quote-block { background:var(--s2); border:1px solid var(--bs); border-left:3px solid rgba(255,255,255,.2); border-radius:0 10px 10px 0; padding:24px 28px; margin:28px 0; }
      .quote-block p { font-family:'EB Garamond',serif; font-size:18px; font-style:italic; line-height:1.65; color:rgba(239,239,239,.8); }
      .quote-block cite { display:block; margin-top:12px; font-size:13px; color:var(--tm); font-style:normal; }
      .expertise-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:28px; }
      .exp-card { background:var(--s2); border:1px solid var(--bs); border-radius:10px; padding:18px; }
      .exp-card .ec-icon { font-size:18px; margin-bottom:8px; display:block; }
      .exp-card h4 { font-size:14px; font-weight:500; margin-bottom:5px; }
      .exp-card p { font-size:12.5px; color:var(--tm); line-height:1.55; }
      @media(max-width:860px){ .about-grid{grid-template-columns:1fr;} .about-img{aspect-ratio:3/2;} }
      @media(max-width:560px){ .expertise-grid{grid-template-columns:1fr;} }
    `}</style>
    <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
      <Reveal><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:18}}>Meet Your Strategist</div></Reveal>
      <Reveal delay={0.05}><h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(36px,4vw,58px)",fontWeight:400,lineHeight:1.1,letterSpacing:"-.02em"}}>Marta Belya</h2></Reveal>
      <Reveal delay={0.08}><p style={{fontSize:14,color:"var(--tm)",marginTop:10}}>Marketing Project Manager · Digital Strategist · Author of "TOP 90 Marketing Frameworks"</p></Reveal>

      <div className="about-grid">
        <Reveal>
          <div className="about-img-wrap">
            <div className="about-img">
              <img src="https://nkqttxagildaxxpllhsg.supabase.co/storage/v1/object/public/Images/photo_2021-10-28_18-18-36.jpg" alt="Marta Belya" />
            </div>
            <div className="stats-row">
              {[["10+","Years Exp."],["50+","Projects"],["90","Frameworks"]].map(([v,l])=>(
                <div key={l} className="stat-c"><div className="sv">{v}</div><div className="sl">{l}</div></div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="about-body">
            <p style={{fontSize:16,color:"var(--tm)",lineHeight:1.78,marginBottom:20}}>
              Marta Belya is a results-driven Marketing Project Manager and Digital Marketing Strategist with over <strong style={{color:"var(--t)"}}>10 years of experience</strong> helping startups, scaleups, and enterprise brands unlock growth through intelligent, actionable marketing strategies.
            </p>
            <p style={{fontSize:16,color:"var(--tm)",lineHeight:1.78}}>
              Marta is the visionary behind the <strong style={{color:"var(--t)"}}>StrategyAI platform</strong> — a tool that merges AI-powered insights with her personal strategic expertise. Every strategy delivered through the platform is personally reviewed to ensure clients receive a plan deeply aligned with their goals and market realities.
            </p>

            <div className="quote-block">
              <p>"Every strategy that goes through our platform gets my personal review. I believe in combining AI efficiency with human insight to deliver strategies that actually work in the real world."</p>
              <cite>— Marta Belya</cite>
            </div>

            <div className="expertise-grid">
              {[
                {icon:"📈",title:"Growth Strategy",desc:"Scaling startups and enterprises through data-driven marketing"},
                {icon:"👥",title:"Team Leadership",desc:"Managing cross-functional teams and complex marketing projects"},
                {icon:"📚",title:"Framework Author",desc:"Author of \"TOP 90 Marketing Frameworks\" — proven methodologies"},
                {icon:"✓",title:"Results-Driven",desc:"Focus on measurable outcomes and ROI-positive strategies"},
              ].map(e=>(
                <div key={e.title} className="exp-card">
                  <span className="ec-icon">{e.icon}</span>
                  <h4>{e.title}</h4>
                  <p>{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

/* ─── PRICING ─── */
const Pricing = ({ setPage }) => {
  const included = ["Comprehensive PDF report","Target audience analysis","SWOT analysis","Channel recommendations","Budget allocation guide","90-day implementation timeline","KPI framework","Competitive positioning","Risk mitigation plan","Expert review by Marta","Email delivery"];
  const comparison = [
    ["Strategy Development","Basic framework","Comprehensive & detailed"],
    ["Delivery Time","2–4 weeks","5–7 days"],
    ["Revisions","Limited (1–2)","Unlimited access"],
    ["Competitor Benchmarking","Rarely included","Always included"],
    ["Implementation Support","Additional cost","Personal consultation"],
  ];
  return (
    <section id="pricing" style={{padding:"104px 0",borderTop:"1px solid var(--b)"}}>
      <style>{`
        .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:64px; }
        .p-card { background:var(--s1); border:1px solid var(--bs); border-radius:14px; padding:36px; position:relative; }
        .p-card.feat { background:var(--bg); border-color:rgba(255,255,255,.18); }
        .p-badge { position:absolute; top:-1px; right:24px; background:white; color:black; font-size:11px; font-weight:600; padding:4px 10px; border-radius:0 0 8px 8px; }
        .p-label { font-size:12px; color:var(--td); margin-bottom:5px; font-family:'DM Mono',monospace; }
        .p-amt { font-family:'EB Garamond',serif; font-size:50px; font-weight:400; line-height:1; margin-bottom:5px; }
        .p-sub { font-size:13px; color:var(--tm); margin-bottom:26px; }
        .p-divider { height:1px; background:var(--b); margin-bottom:22px; }
        .p-list { list-style:none; margin-bottom:28px; }
        .p-list li { font-size:13.5px; color:var(--tm); padding:6px 0; display:flex; gap:10px; }
        .p-list li::before { content:'—'; color:var(--td); flex-shrink:0; }
        .p-list li.yes { color:var(--t); }
        .p-list li.yes::before { content:'✓'; color:var(--green); }
        .p-btn { width:100%; padding:11px; border-radius:8px; font-size:14px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .p-btn-g { background:none; border:1px solid var(--bs); color:var(--tm); transition:border-color .15s,color .15s; }
        .p-btn-g:hover { border-color:var(--bf); color:var(--t); }
        .p-btn-w { background:white; border:1px solid white; color:black; transition:opacity .15s; }
        .p-btn-w:hover { opacity:.86; }
        .incl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }
        .incl-item { display:flex; align-items:center; gap:8px; padding:12px; background:var(--s1); border:1px solid var(--b); border-radius:8px; font-size:13px; color:var(--tm); }
        .incl-item::before { content:'✓'; color:var(--green); flex-shrink:0; }
        .cmp-table { margin-top:56px; border:1px solid var(--b); border-radius:12px; overflow:hidden; }
        .cmp-table table { width:100%; border-collapse:collapse; }
        .cmp-table thead th { padding:16px 22px; text-align:left; font-size:12px; font-weight:500; color:var(--tm); border-bottom:1px solid var(--b); background:rgba(255,255,255,.02); }
        .cmp-table thead th:nth-child(3) { color:var(--green); }
        .cmp-table tbody td { padding:14px 22px; font-size:13.5px; color:var(--tm); border-bottom:1px solid var(--b); }
        .cmp-table tbody tr:last-child td { border-bottom:none; }
        .cmp-table tbody td:first-child { color:var(--t); font-weight:500; }
        .cmp-table tbody td:nth-child(3) { color:var(--green); }
        @media(max-width:860px){ .pricing-grid{grid-template-columns:1fr;} .incl-grid{grid-template-columns:1fr 1fr;} }
        @media(max-width:500px){ .incl-grid{grid-template-columns:1fr;} }
      `}</style>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
        <Reveal><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:18}}>Transparent Pricing</div></Reveal>
        <Reveal delay={0.05}><h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(36px,4vw,58px)",fontWeight:400,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:14}}>Professional strategy,<br/><em style={{fontStyle:"italic",color:"rgba(239,239,239,.4)"}}>affordable price</em></h2></Reveal>
        <Reveal delay={0.1}><p style={{fontSize:16,color:"var(--tm)",maxWidth:540,lineHeight:1.72}}>Most marketing agencies charge £500–£2,500 for strategy work in the UK. We believe great strategy shouldn't be a luxury.</p></Reveal>

        <div className="pricing-grid">
          {/* Traditional */}
          <Reveal>
            <div className="p-card">
              <div className="p-label">Traditional Agencies</div>
              <div className="p-amt" style={{color:"var(--tm)"}}>£500+</div>
              <div className="p-sub">+ additional costs per revision</div>
              <div className="p-divider"/>
              <ul className="p-list">
                {["2–4 weeks delivery","Limited revisions (1–2)","Generic frameworks","Extra costs for changes"].map(i=><li key={i}>{i}</li>)}
              </ul>
              <button className="p-btn p-btn-g" disabled style={{opacity:.4,cursor:"default"}}>Expensive</button>
            </div>
          </Reveal>

          {/* Featured */}
          <Reveal delay={0.06}>
            <div className="p-card feat">
              <div className="p-badge">Best Value</div>
              <div className="p-label">StrategyAI</div>
              <div className="p-amt">£99</div>
              <div className="p-sub">One-time payment, everything included</div>
              <div className="p-divider"/>
              <ul className="p-list">
                {["5–7 day delivery","Comprehensive PDF report","SWOT + audience analysis","Channel strategy & budget guide","90-day implementation roadmap","Expert review by Marta"].map(i=><li key={i} className="yes">{i}</li>)}
              </ul>
              <button className="p-btn p-btn-w" onClick={() => setPage("questionnaire")}>Get Your Strategy</button>
            </div>
          </Reveal>

          {/* DIY */}
          <Reveal delay={0.12}>
            <div className="p-card">
              <div className="p-label">DIY Approach</div>
              <div className="p-amt" style={{color:"var(--tm)"}}>Free</div>
              <div className="p-sub">But costs time & expertise</div>
              <div className="p-divider"/>
              <ul className="p-list">
                {["Weeks of research needed","No expert guidance","High risk of costly mistakes","Significant opportunity cost"].map(i=><li key={i}>{i}</li>)}
              </ul>
              <button className="p-btn p-btn-g" disabled style={{opacity:.4,cursor:"default"}}>Time-consuming</button>
            </div>
          </Reveal>
        </div>

        {/* What's included */}
        <Reveal delay={0.1}>
          <div style={{marginTop:48,padding:"36px",background:"var(--s1)",border:"1px solid var(--bs)",borderRadius:14}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--td)",marginBottom:10}}>What's included in your £50 strategy</div>
            <div className="incl-grid">
              {included.map(i=><div key={i} className="incl-item">{i}</div>)}
            </div>
          </div>
        </Reveal>

        {/* Comparison */}
        <Reveal delay={0.1}>
          <div className="cmp-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Traditional Agencies</th>
                  <th>StrategyAI</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([f,a,u])=>(
                  <tr key={f}><td>{f}</td><td>{a}</td><td>{u}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ─── TESTIMONIALS ─── */
const Testimonials = () => {
  const items = [
    { name:"Sarah Johnson", role:"CEO, TechStart Inc.", initial:"SJ", quote:"StrategyAI completely transformed our marketing approach. The personalised strategy helped us increase leads by 300% in just 2 months." },
    { name:"Michael Chen", role:"Marketing Director, GrowthCorp", initial:"MC", quote:"The AI-generated strategy was incredibly detailed and actionable. It saved us months of research and thousands in consulting fees." },
    { name:"Emily Rodriguez", role:"Founder, BoutiqueStyle", initial:"ER", quote:"As a small business owner, I was struggling with marketing. StrategyAI gave me a clear roadmap that actually works — and Marta's review made it feel genuinely personal." },
  ];
  return (
    <section id="testimonials" style={{padding:"104px 0",background:"var(--s1)",borderTop:"1px solid var(--b)"}}>
      <style>{`
        .testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:64px; }
        .t-card { background:var(--s2); border:1px solid var(--bs); border-radius:14px; padding:28px; transition:border-color .2s; }
        .t-card:hover { border-color:rgba(255,255,255,.18); }
        .t-stars { color:var(--green); font-size:13px; letter-spacing:2px; margin-bottom:16px; }
        .t-quote { font-family:'EB Garamond',serif; font-size:17.5px; font-style:italic; line-height:1.62; color:var(--t); margin-bottom:22px; }
        .t-author { display:flex; align-items:center; gap:10px; }
        .t-avatar { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.07); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:500; flex-shrink:0; }
        .t-name { font-size:13px; font-weight:500; }
        .t-role { font-size:12px; color:var(--td); }
        .stats-row-b { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--b); border:1px solid var(--b); border-radius:14px; overflow:hidden; margin-top:56px; }
        .stat-b { background:var(--s1); padding:28px; text-align:center; }
        .stat-b .bv { font-family:'EB Garamond',serif; font-size:40px; color:var(--t); }
        .stat-b .bl { font-size:13px; color:var(--tm); margin-top:4px; }
        @media(max-width:860px){ .testi-grid{grid-template-columns:1fr;} .stats-row-b{grid-template-columns:1fr 1fr;} }
      `}</style>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
        <Reveal><div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:18}}>Success Stories</div></Reveal>
        <Reveal delay={0.05}><h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(36px,4vw,58px)",fontWeight:400,lineHeight:1.1,letterSpacing:"-.02em",marginBottom:14}}>Loved by<br/><em style={{fontStyle:"italic",color:"rgba(239,239,239,.4)"}}>100+ businesses</em></h2></Reveal>
        <Reveal delay={0.1}><p style={{fontSize:16,color:"var(--tm)",maxWidth:480,lineHeight:1.72}}>Small businesses and startups across the UK and Europe growing smarter with StrategyAI.</p></Reveal>
        <div className="testi-grid">
          {items.map((t,i)=>(
            <Reveal key={t.name} delay={i*0.06}>
              <div className="t-card">
                <div className="t-stars">★★★★★</div>
                <div className="t-quote">"{t.quote}"</div>
                <div className="t-author">
                  <div className="t-avatar">{t.initial}</div>
                  <div><div className="t-name">{t.name}</div><div className="t-role">{t.role}</div></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="stats-row-b">
          {[["4.9★","Average rating"],["100+","Strategies delivered"],["97%","Customer satisfaction"]].map(([v,l])=>(
            <Reveal key={l}>
              <div className="stat-b"><div className="bv">{v}</div><div className="bl">{l}</div></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── FOOTER ─── */
const Footer = ({ setPage }) => (
  <footer style={{borderTop:"1px solid var(--b)",padding:"64px 0 40px",background:"var(--bg)"}}>
    <style>{`
      .footer-top { display:flex; justify-content:space-between; gap:60px; flex-wrap:wrap; margin-bottom:60px; }
      .footer-brand .fn { display:block; font-weight:600; font-size:16px; letter-spacing:-.02em; margin-bottom:12px; }
      .footer-brand p { font-size:13px; color:var(--td); line-height:1.65; max-width:220px; }
      .footer-col h4 { font-size:12px; font-weight:500; color:var(--tm); margin-bottom:16px; letter-spacing:.04em; text-transform:uppercase; font-family:'DM Mono',monospace; }
      .footer-col ul { list-style:none; }
      .footer-col li { margin-bottom:9px; }
      .footer-col a { font-size:13px; color:var(--td); text-decoration:none; transition:color .15s; }
      .footer-col a:hover { color:var(--t); }
      .footer-bottom { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; border-top:1px solid var(--b); padding-top:28px; }
      .footer-bottom p { font-size:12px; color:var(--td); }
      .footer-legal { display:flex; gap:18px; }
      .footer-legal a { font-size:12px; color:var(--td); text-decoration:none; transition:color .15s; }
      .footer-legal a:hover { color:var(--tm); }
    `}</style>
    <div style={{maxWidth:1300,margin:"0 auto",padding:"0 32px"}}>
      <div className="footer-top">
        <div className="footer-brand">
          <span className="fn">StrategyAI</span>
          <p>Professional marketing strategy for small businesses and startups. Affordable, expert-reviewed, fast.</p>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#about">About Marta</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/terms.html">Terms of Service</a></li>
            <li><a href="/cookie.html">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 StrategyAI. Developed by Maksym Belia. All rights reserved.</p>
        <div className="footer-legal">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/cookie.html">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);

/* ─── QUESTIONNAIRE ─── */
const STEPS = [
  {
    id:"contact", icon:"✉️", navTitle:"Contact Info", navSub:"Name & email", title:"Let's start with you", desc:"We'll send your completed strategy to this email.",
    fields:[
      {name:"fullName",label:"Your Full Name",type:"text",placeholder:"Jane Smith",required:true},
      {name:"email",label:"Email Address",type:"email",placeholder:"jane@yourbusiness.com",required:true},
    ]
  },
  {
    id:"business", icon:"🏢", navTitle:"Business Basics", navSub:"Name, industry & type", title:"Tell us about your business", desc:"Basic information helps us tailor the strategy to your market.",
    fields:[
      {name:"businessName",label:"Business Name",type:"text",placeholder:"Acme Ltd",required:true},
      {name:"businessUrl",label:"Website URL",type:"text",placeholder:"https://yourwebsite.com",required:false},
      {name:"industry",label:"Industry",type:"select",options:["Technology","Healthcare","Finance","Retail","Manufacturing","Education","Real Estate","Food & Beverage","Professional Services","E-commerce","SaaS","Other"],required:true},
      {name:"businessType",label:"Business Model",type:"select",options:["B2B — Selling to other businesses","B2C — Selling to consumers","Both B2B and B2C"],required:true},
      {name:"regionOfOperation",label:"Region of Operation",type:"text",placeholder:"e.g., UK, EU, Global, North America",required:true},
    ]
  },
  {
    id:"audience", icon:"👥", navTitle:"Target Audience", navSub:"Who you serve", title:"Who is your ideal customer?", desc:"Be as specific as possible — the more detail, the sharper your strategy.",
    fields:[
      {name:"targetAudience",label:"Describe your ideal customer",type:"textarea",placeholder:"e.g., Small business owners aged 30–50 in the UK who struggle with marketing and have a budget of £500–£2,000/month...",required:true},
    ]
  },
  {
    id:"budget", icon:"💷", navTitle:"Budget & Revenue", navSub:"Current numbers", title:"Budget & revenue", desc:"This helps us recommend strategies appropriate to your scale.",
    fields:[
      {name:"currentRevenue",label:"Current Annual Revenue",type:"radio",options:["Pre-revenue","Under £50K","£50K – £200K","£200K – £500K","£500K – £1M","£1M – £5M","£5M+"],required:true},
      {name:"marketingBudget",label:"Monthly Marketing Budget",type:"radio",options:["Under £500","£500 – £2K","£2K – £10K","£10K – £30K","£30K+"],required:true},
    ]
  },
  {
    id:"goals", icon:"🎯", navTitle:"Goals & Challenges", navSub:"What you want to achieve", title:"Goals & current challenges", desc:"Select everything that applies — we'll prioritise accordingly.",
    fields:[
      {name:"marketingGoals",label:"Primary Marketing Goals",type:"checkbox",options:["Increase brand awareness","Generate more leads","Boost sales conversion","Enter new markets","Launch a new product","Improve customer retention","Build online presence","Grow email list"],required:true},
      {name:"currentChallenges",label:"Current Challenges",type:"checkbox",options:["Limited budget","Unclear target audience","Low conversion rates","Lack of marketing expertise","Inconsistent messaging","Poor online visibility","Difficulty measuring ROI","High customer acquisition cost"],required:true},
    ]
  },
  {
    id:"market", icon:"📊", navTitle:"Market Position", navSub:"Competitors & uniqueness", title:"Your market position", desc:"Understanding your competition helps us find your winning angle.",
    fields:[
      {name:"competitorAnalysis",label:"Who are your main competitors?",type:"textarea",placeholder:"List 2–3 competitors and what makes them successful...",required:true},
      {name:"uniqueValue",label:"What makes you different?",type:"textarea",placeholder:"Your unique value proposition...",required:true},
      {name:"currentMarketing",label:"Current Marketing Activities",type:"checkbox",options:["Social media","Google Ads","Content / blogging","Email marketing","SEO","Paid social (Meta/LinkedIn)","Influencer marketing","Traditional ads","Networking / events","None yet"],required:false},
      {name:"timeframe",label:"When do you want to start implementing?",type:"radio",options:["Immediately","Within 1 month","Within 3 months","Within 6 months","Just planning ahead"],required:true},
    ]
  },
];

const Questionnaire = ({ setPage }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const contentRef = useRef(null);

  const current = STEPS[step];
  const pct = Math.round((step / STEPS.length) * 100);

  const set = (name, val) => setAnswers(p => ({...p, [name]: val}));

  const isValid = () => current.fields.every(f => {
    if (!f.required) return true;
    const v = answers[f.name];
    if (f.type === "checkbox") return Array.isArray(v) && v.length > 0;
    return v && v.toString().trim().length > 0;
  });

  const next = async () => {
    if (!isValid()) return;
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
      contentRef.current?.scrollTo(0, 0);
    } else {
      await submit();
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    // Simulate Supabase insert — replace with real call
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const toggleCheck = (name, val) => {
    const cur = answers[name] || [];
    set(name, cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]);
  };

  const renderField = (f) => {
    const val = answers[f.name];
    if (f.type === "text" || f.type === "email") return (
      <input key={f.name} type={f.type} placeholder={f.placeholder} value={val||""} onChange={e=>set(f.name,e.target.value)} style={inputSt}
        onFocus={e=>{e.target.style.borderColor="var(--bf)";e.target.style.background="var(--s2)"}}
        onBlur={e=>{e.target.style.borderColor="var(--bs)";e.target.style.background="var(--s1)"}}/>
    );
    if (f.type === "textarea") return (
      <textarea key={f.name} placeholder={f.placeholder} value={val||""} onChange={e=>set(f.name,e.target.value)} rows={4} style={{...inputSt,resize:"vertical",minHeight:100,lineHeight:1.65}}
        onFocus={e=>{e.target.style.borderColor="var(--bf)";e.target.style.background="var(--s2)"}}
        onBlur={e=>{e.target.style.borderColor="var(--bs)";e.target.style.background="var(--s1)"}}/>
    );
    if (f.type === "select") return (
      <div key={f.name} style={{position:"relative"}}>
        <select value={val||""} onChange={e=>set(f.name,e.target.value)} style={{...inputSt,paddingRight:36,cursor:"pointer",appearance:"none"}}>
          <option value="">Select an option</option>
          {f.options.map(o=><option key={o} value={o} style={{background:"#1a1a1a"}}>{o}</option>)}
        </select>
        <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"var(--td)",fontSize:12,pointerEvents:"none"}}>▾</span>
      </div>
    );
    if (f.type === "radio") return (
      <div key={f.name} style={{display:"flex",flexDirection:"column",gap:8}}>
        {f.options.map(o=>{
          const sel = val === o;
          return (
            <div key={o} onClick={()=>set(f.name,o)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",border:`1px solid ${sel?"rgba(255,255,255,.24)":"var(--bs)"}`,borderRadius:8,cursor:"pointer",background:sel?"rgba(255,255,255,.04)":"var(--s1)",transition:"all .15s"}}>
              <div style={{width:16,height:16,border:`1px solid ${sel?"white":"var(--bs)"}`,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"border-color .15s"}}>
                {sel && <div style={{width:6,height:6,borderRadius:"50%",background:"white"}}/>}
              </div>
              <span style={{fontSize:14,color:sel?"var(--t)":"var(--tm)"}}>{o}</span>
            </div>
          );
        })}
      </div>
    );
    if (f.type === "checkbox") return (
      <div key={f.name} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {f.options.map(o=>{
          const checked = (answers[f.name]||[]).includes(o);
          return (
            <div key={o} onClick={()=>toggleCheck(f.name,o)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:`1px solid ${checked?"rgba(34,197,94,.35)":"var(--bs)"}`,borderRadius:8,cursor:"pointer",background:checked?"var(--gd)":"var(--s1)",transition:"all .15s"}}>
              <div style={{width:16,height:16,border:`1px solid ${checked?"var(--green)":"var(--bs)"}`,borderRadius:4,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:checked?"var(--green)":"transparent",transition:"all .15s",fontSize:10,color:"black",fontWeight:700}}>{checked?"✓":""}</div>
              <span style={{fontSize:13,color:checked?"var(--t)":"var(--tm)",lineHeight:1.3}}>{o}</span>
            </div>
          );
        })}
      </div>
    );
    return null;
  };

  const inputSt = {width:"100%",background:"var(--s1)",border:"1px solid var(--bs)",borderRadius:9,padding:"12px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"var(--t)",outline:"none",transition:"border-color .15s, background .15s"};

  if (submitted) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 24px 40px"}}>
      <div style={{textAlign:"center",maxWidth:480,animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:"var(--gd)",border:"1px solid rgba(34,197,94,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 28px"}}>✓</div>
        <h2 style={{fontFamily:"'EB Garamond',serif",fontSize:42,fontWeight:400,marginBottom:14}}>You're all set</h2>
        <p style={{fontSize:15,color:"var(--tm)",lineHeight:1.72,marginBottom:28}}>Your questionnaire has been submitted. Marta will review your inputs and your custom strategy will land in your inbox within <strong style={{color:"var(--t)"}}>5–7 business days</strong>.</p>
        <div style={{background:"var(--s1)",border:"1px solid var(--bs)",borderRadius:12,padding:24,textAlign:"left",marginBottom:28}}>
          {[["Email",answers.email||"—"],["Business",answers.businessName||"—"],["Industry",answers.industry||"—"],["Delivery","5–7 business days"]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--b)",fontSize:13}}>
              <span style={{color:"var(--tm)"}}>{k}</span>
              <span style={{fontWeight:500}}>{v}</span>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",fontSize:13}}>
            <span style={{color:"var(--tm)"}}>Status</span>
            <span style={{color:"var(--green)",fontWeight:500}}>Submitted ✓</span>
          </div>
        </div>
        <button onClick={()=>{setPage("home");window.scrollTo(0,0);}} style={{padding:"11px 24px",border:"1px solid var(--bs)",borderRadius:8,background:"none",color:"var(--tm)",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all .15s"}}
          onMouseEnter={e=>{e.target.style.color="var(--t)";e.target.style.borderColor="var(--bf)"}}
          onMouseLeave={e=>{e.target.style.color="var(--tm)";e.target.style.borderColor="var(--bs)"}}>← Back to home</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",paddingTop:56}}>
      <style>{`
        .q-sidebar { width:300px; flex-shrink:0; border-right:1px solid var(--b); padding:44px 28px; position:sticky; top:56px; height:calc(100vh - 56px); overflow-y:auto; display:flex; flex-direction:column; }
        .q-main { flex:1; padding:44px 48px 80px; overflow-y:auto; display:flex; flex-direction:column; align-items:center; }
        .q-form { width:100%; max-width:600px; }
        .q-step-nav { display:flex; flex-direction:column; }
        .q-step-item { display:flex; align-items:flex-start; gap:12px; padding:10px 0; position:relative; cursor:pointer; }
        .q-step-item:not(:last-child)::after { content:''; position:absolute; left:14px; top:38px; bottom:-10px; width:1px; background:var(--b); }
        .q-step-num { width:28px; height:28px; border-radius:50%; border:1px solid var(--bs); display:flex; align-items:center; justify-content:center; font-family:'DM Mono',monospace; font-size:10px; color:var(--td); flex-shrink:0; transition:all .2s; background:var(--s1); z-index:1; }
        .q-step-item.active .q-step-num { border-color:white; color:white; background:rgba(255,255,255,.08); }
        .q-step-item.done .q-step-num { border-color:var(--green); color:var(--green); background:var(--gd); }
        .q-step-t { font-size:13px; font-weight:500; color:var(--td); margin-top:4px; transition:color .15s; }
        .q-step-item.active .q-step-t { color:var(--t); }
        .q-step-item.done .q-step-t { color:var(--tm); }
        .q-step-s { font-size:11px; color:var(--td); margin-top:1px; }
        .step-anim { animation: stepFade .25s ease; }
        @media(max-width:820px){ .q-sidebar{display:none;} .q-main{padding:28px 20px 60px;} }
        @media(max-width:480px){ .q-main{padding:24px 16px 60px;} }
      `}</style>

      {/* Sidebar */}
      <aside className="q-sidebar">
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--td)",marginBottom:20}}>Strategy Questionnaire</div>
        <h2 style={{fontFamily:"'EB Garamond',serif",fontSize:26,fontWeight:400,lineHeight:1.2,marginBottom:12}}>Tell us about your business</h2>
        <p style={{fontSize:13,color:"var(--tm)",lineHeight:1.65,marginBottom:36}}>Takes about 5 minutes. We use your answers to build a fully tailored marketing strategy.</p>
        <div className="q-step-nav" style={{flex:1}}>
          {STEPS.map((s,i)=>(
            <div key={s.id} className={`q-step-item ${i===step?"active":i<step?"done":""}`} onClick={()=>i<step&&setStep(i)}>
              <div className="q-step-num">{i<step?"✓":i+1}</div>
              <div><div className="q-step-t">{s.navTitle}</div><div className="q-step-s">{s.navSub}</div></div>
            </div>
          ))}
        </div>
        <div style={{marginTop:28,paddingTop:20,borderTop:"1px solid var(--b)"}}>
          <p style={{fontSize:12,color:"var(--td)",lineHeight:1.6}}>Your data is <strong style={{color:"var(--tm)"}}>encrypted and private</strong>. We never share your business information with third parties.</p>
        </div>
      </aside>

      {/* Main */}
      <main className="q-main" ref={contentRef}>
        <div className="q-form">
          {/* Progress */}
          <div style={{marginBottom:40}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"var(--td)"}}>Step {step+1} of {STEPS.length}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"var(--td)"}}>{pct}% complete</span>
            </div>
            <div style={{height:2,background:"var(--bs)",borderRadius:100,overflow:"hidden"}}>
              <div style={{height:"100%",background:"white",borderRadius:100,width:`${pct}%`,transition:"width .5s cubic-bezier(.4,0,.2,1)"}}/>
            </div>
          </div>

          {/* Step content */}
          <div key={step} className="step-anim">
            <div style={{marginBottom:36}}>
              <div style={{fontSize:28,marginBottom:14}}>{current.icon}</div>
              <h2 style={{fontFamily:"'EB Garamond',serif",fontSize:"clamp(28px,4vw,38px)",fontWeight:400,lineHeight:1.15,marginBottom:8}}>{current.title}</h2>
              <p style={{fontSize:14,color:"var(--tm)"}}>{current.desc}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:24,marginBottom:40}}>
              {current.fields.map(f=>(
                <div key={f.name}>
                  <label style={{display:"block",fontSize:13,fontWeight:500,color:"var(--tm)",marginBottom:8,letterSpacing:"0.01em"}}>
                    {f.label}{f.required&&<span style={{color:"var(--td)",marginLeft:4}}>*</span>}
                  </label>
                  {renderField(f)}
                </div>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
            <button onClick={()=>step===0?setPage("home"):setStep(s=>s-1)} style={{display:"flex",alignItems:"center",gap:6,padding:"11px 20px",border:"1px solid var(--bs)",borderRadius:8,background:"none",color:"var(--tm)",fontSize:14,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",transition:"all .15s"}}
              onMouseEnter={e=>{e.target.style.color="var(--t)";e.target.style.borderColor="var(--bf)"}}
              onMouseLeave={e=>{e.target.style.color="var(--tm)";e.target.style.borderColor="var(--bs)"}}>
              ← {step===0?"Home":"Back"}
            </button>
            <button onClick={next} disabled={!isValid()||submitting} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 24px",border:"none",borderRadius:8,background:"white",color:"black",fontSize:14,fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:isValid()&&!submitting?"pointer":"not-allowed",opacity:isValid()&&!submitting?1:.35,transition:"opacity .15s, transform .15s"}}
              onMouseEnter={e=>{if(isValid()&&!submitting){e.target.style.opacity=".86";e.target.style.transform="translateY(-1px)";}}}
              onMouseLeave={e=>{e.target.style.opacity=isValid()&&!submitting?"1":".35";e.target.style.transform="translateY(0)";}}>
              {submitting?"Submitting…":step===STEPS.length-1?"Submit Strategy →":"Continue →"}
            </button>
          </div>

          {error && <div style={{marginTop:16,padding:"12px 16px",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:8,fontSize:13,color:"#fca5a5"}}>{error}</div>}
        </div>
      </main>
    </div>
  );
};

/* ─── HOME PAGE ─── */
const HomePage = ({ setPage }) => (
  <>
    <Hero setPage={setPage}/>
    <Features/>
    <Analytics/>
    <HowItWorks/>
    <About/>
    <Pricing setPage={setPage}/>
    <Testimonials/>
    <Footer setPage={setPage}/>
  </>
);

/* ─── APP ROOT ─── */
export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <>
      <GlobalStyles/>
      <Nav page={page} setPage={setPage}/>
      {page === "home" ? <HomePage setPage={setPage}/> : <Questionnaire setPage={setPage}/>}
    </>
  );
}
