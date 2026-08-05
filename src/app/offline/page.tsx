"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
        background: "#1e1e1f",
        color: "#fff",
      }}
    >
      <div style={{ fontSize: 48 }}>📡</div>
      <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
        You&apos;re offline
      </h1>
      <p style={{ color: "#a0a0a0", maxWidth: 320, margin: 0 }}>
        SmartSpend needs an internet connection to load your data. Please check
        your connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: 8,
          padding: "10px 24px",
          borderRadius: 999,
          border: "none",
          background: "#CDF345",
          color: "#121212",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Retry
      </button>
    </div>
  );
}
