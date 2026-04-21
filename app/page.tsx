import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

// Ini SERVER COMPONENT (gaada "use client" di atasnya).
// Dia jalan di backend/server Next.js, narik data dari Supabase dengan kecepatan cahaya.
export const revalidate = 0; // Pastiin selalu fetch data terbaru

export default async function Page() {
  
  // 1. Tarik Data Experience
  const experiences = await prisma.experience.findMany({
    orderBy: { createdAt: "desc" }
  });

  // Pisahin otomatis berdasarkan Kategori
  const leadershipExps = experiences.filter(exp => exp.category === "Leadership");
  const eventExps = experiences.filter(exp => exp.category === "Event");
  const sosmasExps = experiences.filter(exp => exp.category === "Sosmas");

  // 2. Tarik Data Project
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  // Pisahin Masterpiece (Sorotan) dan Arsip
  const masterpieceProjects = projects.filter(proj => proj.isFeatured === true);
  const archiveProjects = projects.filter(proj => proj.isFeatured === false);

  // Lempar datanya ke Mesin Animasi (HomeClient)
  return (
    <HomeClient 
      leadershipExps={leadershipExps}
      eventExps={eventExps}
      sosmasExps={sosmasExps}
      masterpieceProjects={masterpieceProjects}
      archiveProjects={archiveProjects}
    />
  );
}