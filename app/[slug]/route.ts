import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } 
) {
  try {
    const { slug } = await params; 
    
    // 1. CCTV: Liat slug apa yang ditangkep sama browser
    console.log("🕵️‍♂️ ADA YANG NYOBA AKSES SLUG:", slug);

    // 2. Abaikan kalau browser cuma nyari file internal (kayak gambar/favicon)
    if (slug.includes('.') || slug === 'favicon.ico' || slug.startsWith('_next')) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 3. Cari di database
    const link = await prisma.shortlink.findUnique({
      where: { slug: slug },
    });

    if (link) {
      console.log("✅ KETEMU BOSKU! Mau diarahin ke:", link.url); // CCTV
      let targetUrl = link.url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      return NextResponse.redirect(targetUrl);
    }

    // 4. Kalau beneran ga ada di DB
    console.log("❌ WADUH, SLUG NGGAK ADA DI DATABASE!"); // CCTV
    return NextResponse.redirect(new URL("/", request.url));
    
  } catch (error) {
    console.error("🔥 DRAMA SHORTLINK ERROR:", error); 
    return NextResponse.redirect(new URL("/", request.url));
  }
}