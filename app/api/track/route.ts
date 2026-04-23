import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ✅ Fix Error Prisma (pakai kurung kurawal)
import { UAParser } from "ua-parser-js"; // ✅ Fix Error UAParser (pakai kurung kurawal)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, referrer, userAgent, sessionId } = body;

    // Intelijen pembaca User-Agent
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    // UAParser ngembaliin 'mobile', 'tablet', atau undefined kalau dia Desktop
    const deviceType = parser.getDevice().type; 
    const device = deviceType === "mobile" || deviceType === "tablet" ? deviceType : "Desktop";

    // Simpen ke Database Supabase!
    await prisma.visitorLog.create({
      data: {
        sessionId,
        path,
        browser,
        os,
        device,
        referrer: referrer || "Direct",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracker Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}