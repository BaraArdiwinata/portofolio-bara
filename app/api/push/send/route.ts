import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.mailto || "mailto:admin@bara-ardiwinata.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json();
    const subs = await prisma.pushSubscription.findMany();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifications = subs.map((sub: any) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ title, body, url: url || "/admin" })
      ).catch((err) => {
        if (err.statusCode === 410) {
          return prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      })
    );

    await Promise.all(notifications);
    return NextResponse.json({ status: "Sent" });
  } catch (error) {
    console.error("Push Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}