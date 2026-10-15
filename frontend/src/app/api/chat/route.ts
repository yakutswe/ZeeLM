import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("message" in body) || typeof body.message !== "string" || !body.message.trim()) return NextResponse.json({error:"Message required"},{status:400});
    const history = "history" in body && Array.isArray(body.history) ? body.history.filter((m): m is {role:"user"|"assistant";content:string} => m && typeof m === "object" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-12) : [];
    const response = await fetch("http://127.0.0.1:8000/chat", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:body.message,history}),signal:AbortSignal.timeout(120000),cache:"no-store"});
    if (!response.ok) return NextResponse.json({error:"Local ZeeLM backend error"},{status:502});
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string") return NextResponse.json({error:"Invalid model response"},{status:502});
    return NextResponse.json({reply:data.reply});
  } catch { return NextResponse.json({error:"Cannot reach FastAPI / Ollama on localhost"},{status:503}); }
}
