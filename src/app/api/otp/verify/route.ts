import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

function hashCode(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(req: Request) {
    try {
        const { phone, userId, code } = await req.json();

        if(!phone || !userId || !code) {
            return NextResponse.json({ error: "Phone, User ID, and Code are required" }, { status: 400 })
        }

        const codeHash = hashCode(code);

        const supabase = await createClient();

        const {data: rows, error} = await supabase
            .from('otp_codes')
            .select("*")
            .eq("user_id", userId)
            .eq("phone", phone)
            .order('created_at', { ascending: false })
            .limit(5);

        if(error || !rows?.length) {
            return NextResponse.json({ error: "OTP Not Found" }, { status: 400 })
        }

        const now = Date.now();
        const record = rows.find(r => new Date(r.expires_at).getTime() > now)

        if(!record) {
            return NextResponse.json({error: "OTP Expired"}, {status: 400})
        }

        const attempts = (record.attempt_count || 0) + 1;

        if(attempts > 5) {
            return NextResponse.json({error: "Too many attempts"}, {status: 429})
        }

        await supabase.from("otp_codes")
            .update({attempt_count: attempts})
            .eq('id', record.id)

        if(record.code_hash !== codeHash) {
            return NextResponse.json({error: "Invalid code"}, {status: 400})
        }

        const res = NextResponse.json({ok : true})
        res.cookies.set('mfa_ok', 'true', {
            httpOnly:  true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 30
        })

        return res;

    } catch(e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}