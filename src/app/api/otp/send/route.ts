import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function randomOTP(length: number = 6) {
    const n = crypto.randomInt(0, 10 ** length).toString().padStart(length, "0")
    return n;
}

function hashCode(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: Request) {
    try {
        const { phone, userId } = await req.json();

        if (!phone || !userId) {
            return NextResponse.json({ error: "Phone and User ID are required" }, { status: 400 })
        }

        const supabase = await createClient();

        const { data: recent } = await supabase
            .from('otp_codes')
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (recent && Date.now() - new Date(recent.created_at).getTime() < 30_000) {
            return NextResponse.json({ error: "Wait before requesting a new code" }, { status: 429 })
        }

        const code = randomOTP(6);
        const codeHash = hashCode(code);
        const expires = new Date(Date.now() + 5 * 60_000);

        await supabase.from("otp_codes").insert({
            user_id: userId,
            phone,
            code_hash: codeHash,
            expires_at: expires.toUTCString(),
        })

        const text = `Your OTP code is ${code}. It will expire in 5 minutes. Do not share this code with anyone.`;
        const resp = await fetch(process.env.WHATSAPP_360_BASE_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "D360-API-KEY": process.env.WHATSAPP_360_TOKEN!
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phone,
                type: "text",
                text: { body: text }
            })
        })

        if (!resp.ok) {
            const errText = await resp.text();
            return NextResponse.json({ error: `Failed to send OTP: ${errText}` }, { status: 502 })
        }

        return NextResponse.json({ ok: true })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}