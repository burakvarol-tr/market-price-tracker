"use client";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-500 print:hidden"
    >
      PDF olarak kaydet
    </button>
  );
}
