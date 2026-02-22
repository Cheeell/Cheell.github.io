import React, { useEffect, useState } from 'react';

export default function ThankYouPage({ onStartOver = () => {} }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const items = [
    "Market Analysis",
    "Target Audience",
    "Competitive SWOT",
    "Implementation Roadmap",
    "Budget Allocation",
    "Professional PDF",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ty-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .ty-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(134, 239, 172, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99, 102, 241, 0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        .card {
          position: relative;
          max-width: 520px;
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 3rem;
          backdrop-filter: blur(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .check-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
        }

        .check-icon {
          font-size: 24px;
          color: rgba(255,255,255,0.7);
          font-family: 'Cormorant Garamond', serif;
          animation: pop 0.4s ease 0.5s both;
        }

        @keyframes pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 1.5rem;
        }

        .badge-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(134, 239, 172, 0.8);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          color: #f0f0f0;
          line-height: 1.1;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: rgba(255,255,255,0.35);
          font-size: 0.875rem;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 0 0 2rem;
        }

        .section-label {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 1rem;
        }

        .items-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 2.5rem;
        }

        .item {
          padding: 10px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.05);
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          animation: fadeIn 0.4s ease both;
          transition: background 0.2s, border-color 0.2s;
        }

        .item:hover {
          background: rgba(255,255,255,0.045);
          border-color: rgba(255,255,255,0.09);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .trust-row {
          display: flex;
          justify-content: center;
          gap: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .trust-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .trust-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: rgba(255,255,255,0.55);
        }

        .trust-sub {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="ty-root" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <div className="grid-bg" />
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div className="check-wrap">
              <span className="check-icon">✓</span>
            </div>

            <div className="badge">
              <div className="badge-dot" />
              Payment Confirmed — £50.00
            </div>

            <h1>Thank you.</h1>

            <p className="subtitle">Your marketing strategy is being prepared<br />and will be delivered to your inbox shortly.</p>
          </div>

          <div className="divider" />

          <p className="section-label">What's included</p>

          <div className="items-grid">
            {items.map((label, i) => (
              <div className="item" key={i} style={{ animationDelay: `${0.5 + i * 0.07}s` }}>
                {label}
              </div>
            ))}
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <span className="trust-num">4.9</span>
              <span className="trust-sub">Rated</span>
            </div>
            <div className="trust-item">
              <span className="trust-num">SSL</span>
              <span className="trust-sub">Secured</span>
            </div>
            <div className="trust-item">
              <span className="trust-num">AI</span>
              <span className="trust-sub">Powered</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}