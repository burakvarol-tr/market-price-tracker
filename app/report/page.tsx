import Link from "next/link";

export default function ReportPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 40 }}>REPORT SAYFASI ÇALIŞIYOR</h1>

        <p style={{ marginTop: 20 }}>
          Eğer bunu görüyorsan problem çözüldü 🎯
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "12px 16px",
            background: "#2563eb",
            borderRadius: 10,
            color: "white",
            textDecoration: "none",
          }}
        >
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}