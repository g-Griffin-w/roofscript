import { useState } from "react";
import Head from "next/head";

const JOB_TYPES = [
  "Full roof replacement",
  "Storm damage repair",
  "Partial repair",
  "Insurance claim job",
  "Commercial flat roof",
];

const MATERIALS = [
  "Architectural shingles",
  "Metal roofing",
  "3-tab shingles",
  "Tile",
  "Flat / TPO",
];

const SCRIPT_TYPES = [
  "In-person close",
  "Phone follow-up",
  "Text message",
  "Objection handler",
];

const TONES = [
  { id: "Confident closer", label: "Confident closer" },
  { id: "Friendly & consultative", label: "Friendly & consultative" },
  { id: "Urgency-driven", label: "Urgency-driven" },
  { id: "Soft sell", label: "Soft sell" },
];

export default function Home() {
  const [jobType, setJobType] = useState(JOB_TYPES[0]);
  const [amount, setAmount] = useState("");
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [scriptType, setScriptType] = useState(SCRIPT_TYPES[0]);
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState(TONES[0].id);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setScript("");
    setError("");
    setCopied(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobType, amount, material, scriptType, tone, notes }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setScript(data.script);
    } catch (e) {
      setError(e.message);
    }

    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function reset() {
    setScript("");
    setNotes("");
    setError("");
  }

  return (
    <>
      <Head>
        <title>RoofScript — AI Sales Scripts for Roofers</title>
        <meta name="description" content="Generate custom roofing sales scripts in seconds. Close more jobs." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 60px" }}>

        {/* Header */}
        <header style={{ padding: "40px 0 36px", borderBottom: "1px solid #2e2e2e", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, color: "#f5f2ed", lineHeight: 1 }}>
              ROOF
            </h1>
            <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, color: "#e85d04", lineHeight: 1 }}>
              SCRIPT
            </h1>
          </div>
          <p style={{ fontSize: 16, color: "#6b6b6b", maxWidth: 420 }}>
            AI-powered sales scripts for roofers. Fill in the job — get a closer-ready script in seconds.
          </p>
        </header>

        {/* Form */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <Field label="Job type">
            <Select value={jobType} onChange={e => setJobType(e.target.value)} options={JOB_TYPES} />
          </Field>

          <Field label="Estimate amount">
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. $14,500"
              style={inputStyle}
            />
          </Field>

          <Field label="Roofing material">
            <Select value={material} onChange={e => setMaterial(e.target.value)} options={MATERIALS} />
          </Field>

          <Field label="Script type">
            <Select value={scriptType} onChange={e => setScriptType(e.target.value)} options={SCRIPT_TYPES} />
          </Field>

          <Field label="Situation notes (optional)" full>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Homeowner wants 3 quotes. Insurance approved. Hesitant on price..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </Field>
        </div>

        {/* Tone selector */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Tone
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TONES.map(t => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 2,
                  fontSize: 14,
                  fontWeight: tone === t.id ? 600 : 400,
                  cursor: "pointer",
                  border: tone === t.id ? "2px solid #e85d04" : "1px solid #2e2e2e",
                  background: tone === t.id ? "#e85d04" : "transparent",
                  color: tone === t.id ? "#fff" : "#6b6b6b",
                  transition: "all 0.15s",
                  fontFamily: "'Barlow', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: loading ? "#3a1f00" : "#e85d04",
            color: loading ? "#6b6b6b" : "#fff",
            border: "none",
            borderRadius: 2,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Generating your script..." : "Generate script →"}
        </button>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 20, padding: "14px 16px", background: "#2a0a0a", border: "1px solid #6b1a1a", borderRadius: 2, fontSize: 14, color: "#f87171" }}>
            {error}
          </div>
        )}

        {/* Output */}
        {script && !loading && (
          <div style={{ marginTop: 28, background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 2 }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #2e2e2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#e85d04", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                Your script — {scriptType}
              </span>
              <span style={{ fontSize: 12, color: "#6b6b6b" }}>{tone}</span>
            </div>

            <div style={{ padding: "24px 20px", fontSize: 15, lineHeight: 1.85, color: "#f5f2ed", whiteSpace: "pre-wrap" }}>
              {script}
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid #2e2e2e", display: "flex", gap: 10 }}>
              <button onClick={copy} style={{ ...actionBtn, background: copied ? "#e85d04" : "transparent", color: copied ? "#fff" : "#f5f2ed", borderColor: copied ? "#e85d04" : "#2e2e2e" }}>
                {copied ? "Copied!" : "Copy script"}
              </button>
              <button onClick={reset} style={{ ...actionBtn }}>
                New script
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid #2e2e2e", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#3a3a3a" }}>
            RoofScript — Built for closers.
          </p>
        </footer>
      </div>
    </>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6b6b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={onChange} style={inputStyle}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 14,
  background: "#1a1a1a",
  color: "#f5f2ed",
  border: "1px solid #2e2e2e",
  borderRadius: 2,
  outline: "none",
  fontFamily: "'Barlow', sans-serif",
};

const actionBtn = {
  padding: "8px 18px",
  fontSize: 13,
  fontFamily: "'Barlow', sans-serif",
  fontWeight: 500,
  borderRadius: 2,
  border: "1px solid #2e2e2e",
  background: "transparent",
  color: "#f5f2ed",
  cursor: "pointer",
  transition: "all 0.15s",
};
