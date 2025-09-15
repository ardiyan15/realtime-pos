"use client";

import { useState } from "react";
// import { create } from '@supabase/auth-helpers-nextjs';
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function OtpPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sendOtp() {
    setSending(true);
    setMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMsg("Harus login dulu.");
      setSending(false);
      return;
    }

    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, userId: user.id }),
    });
    const j = await res.json();
    if (!res.ok) setMsg(j.error || "Gagal kirim OTP");
    else setMsg("OTP dikirim via WhatsApp 🎉");
    setSending(false);
  }

  async function verifyOtp() {
    setVerifying(true);
    setMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMsg("Harus login dulu.");
      setVerifying(false);
      return;
    }

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, userId: user.id, code }),
    });
    const j = await res.json();
    if (!res.ok) setMsg(j.error || "Verifikasi gagal");
    else router.replace(next);
    setVerifying(false);
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Verifikasi OTP</h1>
      <input
        className="border rounded p-2 w-full"
        placeholder="Nomor WhatsApp (62...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        className="bg-black text-white rounded p-2 w-full disabled:opacity-50"
        onClick={sendOtp}
        disabled={sending || !phone}
      >
        {sending ? "Mengirim..." : "Kirim OTP"}
      </button>

      <input
        className="border rounded p-2 w-full"
        placeholder="Masukkan kode 6 digit"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="bg-black text-white rounded p-2 w-full disabled:opacity-50"
        onClick={verifyOtp}
        disabled={verifying || code.length !== 6}
      >
        {verifying ? "Memverifikasi..." : "Verifikasi"}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
