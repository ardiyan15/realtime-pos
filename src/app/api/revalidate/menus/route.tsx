import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
  try {
    revalidateTag("menus");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (e) {
    return NextResponse.json({ revalidated: false, error: String(e) }, { status: 500 });
  }
}
