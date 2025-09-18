'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client'; // pakai createBrowserClient versi kamu

export default function OtpPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-kirim OTP saat halaman dibuka
  useEffect(() => {
    (async () => {
      setSending(true);
      setMsg(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMsg('Harus login dulu.'); setSending(false); return; }

      const r = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const j = await r.json();
      setMsg(r.ok ? 'OTP dikirim via WhatsApp 🎉' : (j?.error || 'Gagal mengirim OTP'));
      setSending(false);
    })();

    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resend() {
    setSending(true); setMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Harus login dulu.'); setSending(false); return; }

    const r = await fetch('/api/otp/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    const j = await r.json();
    setMsg(r.ok ? 'OTP dikirim ulang 🎉' : (j?.error || 'Gagal mengirim OTP'));
    setSending(false);
  }

  async function verify(codeArg?: string) {
    const useCode = (codeArg ?? code).trim();
    if (useCode.length !== 6 || verifying) return;

    setVerifying(true); setMsg(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg('Harus login dulu.'); setVerifying(false); return; }

    const r = await fetch('/api/otp/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, code: useCode }),
    });
    const j = await r.json();

    if (!r.ok) {
      setMsg(j?.error || 'Verifikasi gagal');
      setVerifying(false);
      return;
    }

    router.replace(next);
  }

  // Auto-submit saat 6 digit (dengan debounce 300ms)
  function handleChange(valRaw: string) {
    const val = valRaw.replace(/\D/g, '').slice(0, 6); // hanya angka, max 6
    setCode(val);

    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (val.length === 6) {
      autoTimer.current = setTimeout(() => verify(val), 300);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    handleChange(pasted);
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-5">
      <h1 className="text-xl font-semibold">Verifikasi OTP</h1>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Kode 6 digit</label>
        <input
          className="border rounded p-3 w-full tracking-widest text-center text-lg"
          placeholder="••••••"
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          inputMode="numeric"
          autoFocus
          maxLength={6}
          aria-label="Masukkan kode OTP 6 digit"
        />
        <p className="text-xs text-gray-500">Kami telah mengirimkan kode via WhatsApp.</p>
      </div>

      <button
        className="bg-black text-white rounded p-3 w-full disabled:opacity-50"
        onClick={() => verify()}
        disabled={verifying || code.length !== 6}
      >
        {verifying ? 'Memverifikasi…' : 'Verifikasi'}
      </button>

      <button
        type="button"
        className="border rounded p-3 w-full disabled:opacity-50"
        onClick={resend}
        disabled={sending}
      >
        {sending ? 'Mengirim…' : 'Kirim Ulang OTP'}
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
