"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// --- 1. Design System & Theme ---
const theme = {
  colors: {
    primary: "#4F46E5", // Indigo 600
    primaryHover: "#4338CA", // Indigo 700
    secondary: "#F3F4F6", // Gray 100
    text: "#1F2937", // Gray 800
    textLight: "#6B7280", // Gray 500
    surface: "#FFFFFF",
    border: "#E5E7EB",
    bg: "#FAFAFB",
    success: "#10B981",
    error: "#EF4444",
    accent: "#EEF2FF", // Indigo 50
  },
  shadows: {
    nav: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    card: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)",
  },
  radius: "12px",
  anim: "all 0.2s ease-in-out",
};

// --- 2. Helper Components ---

// Button with Hover State Logic
const ModernButton = ({ onClick, children, disabled, variant = "primary", style = {} }) => {
  const [hover, setHover] = useState(false);

  const baseStyle = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: theme.anim,
    width: style.width || "100%",
    opacity: disabled ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    ...style,
  };

  const variants = {
    primary: {
      backgroundColor: hover ? theme.colors.primaryHover : theme.colors.primary,
      color: "#fff",
      boxShadow: hover ? "0 4px 10px rgba(79, 70, 229, 0.2)" : "none",
    },
    secondary: {
      backgroundColor: hover ? "#E5E7EB" : theme.colors.secondary,
      color: theme.colors.text,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

// Navbar Component
const Navbar = ({ activeTab, setActiveTab }) => {
  const navStyle = {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${theme.colors.border}`,
    boxShadow: theme.shadows.nav,
    padding: "0.75rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const logoStyle = {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: "-0.02em",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const getLinkStyle = (isActive) => ({
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: isActive ? theme.colors.primary : theme.colors.textLight,
    backgroundColor: isActive ? theme.colors.accent : "transparent",
    transition: theme.anim,
    border: "none",
  });

  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        <span>✨ UnBias Platform</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => setActiveTab("analyze")}
          style={getLinkStyle(activeTab === "analyze")}
        >
          Analyzer
        </button>
        <button
          onClick={() => setActiveTab("rewrite")}
          style={getLinkStyle(activeTab === "rewrite")}
        >
          Rewriter
        </button>
      </div>
    </nav>
  );
};

// Styled InfoRow (used in AnalyzerView)
function InfoRow({ title, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h4
        style={{
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: theme.colors.textLight,
          marginBottom: "0.5rem",
          fontWeight: "600",
        }}
      >
        {title}
      </h4>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {items.map((x, i) => (
          <li
            key={i}
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.primary,
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "0.9rem",
              fontWeight: "500",
              border: `1px solid ${theme.colors.primary}20`,
            }}
          >
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}


// --- 3. Analyzer View (Your original code, styled) ---

const AnalyzerView = () => {
  const [mode, setMode] = useState("text");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Your Analyzer Run Logic
  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      let textToAnalyze = input;

      if (mode === "url") {
        const extractRes = await axios.post("http://localhost:8000/api/extract-text", {
          url: input,
          fields: "raw_text"
        });
        textToAnalyze = extractRes.data.text;
      }

      const res = await axios.post("http://localhost:8000/api/analyze", { text: textToAnalyze });
      const raw = res.data;

      setResult({
        angle_summary: raw.angle?.angle_summary || "No summary detected",
        framing_patterns: raw.angle?.framing_patterns || [],
        dominant_emotions: raw.angle?.dominant_emotions || [],
        evidence_spans: raw.angle?.evidence_spans || [],
        confidence: raw.angle?.confidence || 0,
        political_score: raw.spectrum?.left_right_score ?? 0.5,
        political_summary: raw.spectrum?.cluster
          ? `${raw.spectrum.cluster} (Populist: ${raw.spectrum.populist_score})`
          : "No political scoring",
        reflection: raw.reflection?.first?.raw_response || "",
      });
    } catch {
      setError("Something went wrong — try again.");
    }

    setLoading(false);
  };

  const reset = () => {
    setInput("");
    setResult(null);
    setError("");
  };

  // Styles for AnalyzerView
  const styles = {
    title: {
      fontSize: "2.5rem", fontWeight: "800", background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #818CF8 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 1rem 0", textAlign: "center",
    },
    subtitle: {
      color: theme.colors.textLight, fontSize: "1rem", textAlign: "center", marginBottom: "2rem",
    },
    tabs: {
      display: "flex", backgroundColor: theme.colors.secondary, padding: "4px", borderRadius: theme.radius, marginBottom: "1.5rem", width: "fit-content", marginLeft: "auto", marginRight: "auto",
    },
    tabButton: (isActive) => ({
      backgroundColor: isActive ? theme.colors.surface : "transparent", boxShadow: isActive ? theme.shadows.nav : "none", color: isActive ? theme.colors.primary : theme.colors.textLight, padding: "8px 24px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600", transition: theme.anim,
    }),
    textarea: {
      width: "100%", padding: "1.25rem", fontSize: "1rem", lineHeight: "1.6", color: theme.colors.text, backgroundColor: isFocused ? "#fff" : theme.colors.bg, border: `2px solid ${isFocused ? theme.colors.primary : theme.colors.border}`, borderRadius: theme.radius, outline: "none", transition: theme.anim, resize: "vertical", minHeight: "200px", boxSizing: "border-box", marginBottom: "1.5rem",
    },
    sectionTitle: {
      fontSize: "1.25rem", fontWeight: "700", marginBottom: "1rem", color: theme.colors.text,
    },
    section: {
      marginTop: "2rem", paddingTop: "2rem", borderTop: `1px solid ${theme.colors.border}`, animation: "fadeIn 0.5s ease-out forwards",
    },
    reflectionBox: {
      backgroundColor: "#111827", color: "#10B981", padding: "1.5rem", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.9rem", lineHeight: "1.6", overflowX: "auto", marginTop: "1rem", whiteSpace: "pre-wrap",
    },
    error: {
      color: theme.colors.error, backgroundColor: "#FEF2F2", padding: "1rem", borderRadius: "8px", marginTop: "1rem", textAlign: "center",
    },
  };

  return (
    <main>
      <h1 style={styles.title}>UnBias Analyzer</h1>
      <p style={styles.subtitle}>Detect nuance, framing, and political leanings in any text or article.</p>

      {!result && (
        <div style={{ animation: "fadeIn 0.3s ease-out" }}>
          {/* Mode Switcher */}
          <div style={styles.tabs}>
            <button onClick={() => setMode("text")} style={styles.tabButton(mode === "text")}>
              Enter Text
            </button>
            <button onClick={() => setMode("url")} style={styles.tabButton(mode === "url")}>
              Paste Article Link
            </button>
          </div>

          {/* Input Area */}
          <textarea
            rows={8}
            placeholder={mode === "text" ? "Paste text here..." : "Paste article link here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={styles.textarea}
          />

          <ModernButton disabled={loading || !input} onClick={run}>
            {loading ? "Analyzing..." : "Analyze"}
          </ModernButton>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      )}

      {result && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          <section>
            <h2 style={styles.sectionTitle}>Overall Angle Summary</h2>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.7", color: theme.colors.text }}>{result.angle_summary}</p>
          </section>

          <section style={styles.section}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ ...styles.sectionTitle, marginBottom: 0 }}>Angle Breakdown</h2>
              <span style={{
                backgroundColor: theme.colors.success,
                color: "#fff",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "bold"
              }}>
                Confidence: {Math.round(result.confidence * 100)}%
              </span>
            </div>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '20px',
            }}>
              <InfoRow title="Framing Patterns" items={result.framing_patterns} />
              <InfoRow title="Dominant Emotions" items={result.dominant_emotions} />
              <InfoRow title="Evidence Spans" items={result.evidence_spans} />
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Political Spectrum</h2>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>Score: {result.political_score}</span>
            </div>
            <p style={{ color: theme.colors.textLight }}>{result.political_summary}</p>
          </section>

          {result.reflection && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>LLM Reflection</h2>
              <pre style={styles.reflectionBox}>{result.reflection}</pre>
            </section>
          )}

          <div style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}>
            <ModernButton variant="secondary" onClick={reset} style={{ width: "auto", padding: "12px 30px" }}>
              Run Another Analysis
            </ModernButton>
          </div>
        </div>
      )}
    </main>
  );
};


// --- 4. Rewriter View (The functional component with text input) ---
const RewriterView = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Rewriter Run Logic
  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await axios.post(
        "https://mumbaihacks25unbias.onrender.com/api/unbias",
        { text: input },
        { headers: { "Content-Type": "application/json" } }
      );
      setOutput(res.data.unbiased_text);
    } catch (err) {
      console.error(err);
      setError("Failed to rewrite text — try again.");
    }
    setLoading(false);
  };

  // Styles for RewriterView
  const styles = {
    title: {
      fontSize: "2.5rem", fontWeight: "800", color: theme.colors.text, margin: "0 0 1rem 0", textAlign: "center",
    },
    subtitle: {
      color: theme.colors.textLight, fontSize: "1rem", textAlign: "center", marginBottom: "2rem",
    },
    textarea: {
      width: "100%", padding: "1.25rem", fontSize: "1rem", lineHeight: "1.6", color: theme.colors.text, backgroundColor: isFocused ? "#fff" : theme.colors.bg, border: `2px solid ${isFocused ? theme.colors.primary : theme.colors.border}`, borderRadius: theme.radius, outline: "none", transition: theme.anim, resize: "vertical", minHeight: "180px", boxSizing: "border-box", marginBottom: "1.5rem",
    },
    outputBox: {
      marginTop: "2rem", backgroundColor: "#F0FDF4", border: `1px solid ${theme.colors.success}30`, borderRadius: theme.radius, padding: "1.5rem", animation: "fadeIn 0.4s ease-out",
    },
    outputHeader: {
      display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", color: theme.colors.success, fontWeight: "700", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em",
    },
    outputText: {
      whiteSpace: "pre-wrap", color: "#064E3B", lineHeight: "1.6",
    },
    error: {
      marginTop: "1rem", padding: "1rem", backgroundColor: "#FEF2F2", color: theme.colors.error, borderRadius: "8px", textAlign: "center",
    },
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <h1 style={styles.title}>Neutralize Bias</h1>
      <p style={styles.subtitle}>
        Transform persuasive or subjective text into neutral, objective language.
      </p>

      <textarea
        rows={7}
        placeholder="Paste biased / persuasive text here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.textarea}
      />

      <ModernButton onClick={run} disabled={loading || !input}>
        {loading ? "Rewriting..." : "Rewrite Without Bias"}
      </ModernButton>

      {error && <p style={styles.error}>{error}</p>}

      {output && (
        <div style={styles.outputBox}>
          <div style={styles.outputHeader}>
            <span>✨ Unbiased Result</span>
            <span style={{ fontSize: "1.2rem" }}>⚖️</span>
          </div>
          <div style={styles.outputText}>{output}</div>
        </div>
      )}
    </div>
  );
};


// --- 5. Main App Wrapper ---

export default function UnBiasApp() {
  const [activeTab, setActiveTab] = useState("analyze"); 

  // Global Styles & Animations injection
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      body { margin: 0; background-color: ${theme.colors.bg}; font-family: 'Inter', system-ui, sans-serif; }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(styleSheet);
    return () => {
       if(document.head.contains(styleSheet)) document.head.removeChild(styleSheet);
    };
  }, []);

  const pageContainer = {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "0 20px",
  };

  const cardStyle = {
    backgroundColor: theme.colors.surface,
    padding: "3rem",
    borderRadius: "24px",
    boxShadow: theme.shadows.card,
    border: `1px solid ${theme.colors.border}`,
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.bg }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={pageContainer}>
        <div style={cardStyle}>
          {activeTab === "analyze" ? <AnalyzerView /> : <RewriterView />}
        </div>
      </main>
    </div>
  );
}