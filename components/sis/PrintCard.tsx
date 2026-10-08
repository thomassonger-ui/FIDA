"use client";

export default function PrintCard() {
  return (
    <button onClick={() => window.print()} className="btn-primary text-sm print:hidden">
      Print ID card
    </button>
  );
}
