"use sign"; // Eh canda, "use server" deng wkwkwk
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Tipe data buat nangkep inputan form Project
export interface ProjectData {
  title: string;
  type: string;
  description?: string; // Optional karena arsip kadang ga pake deskripsi
  image?: string;       // Optional buat gambar Masterpiece
  techStack: string[];  // Array teks buat nyimpen Next.js, Tailwind, dll
  link?: string;
  isFeatured: boolean;  // True = Masuk Masterpiece, False = Masuk Arsip
}

// 🟢 1. POST: Nambah Project Baru
export async function createProject(data: ProjectData) {
  try {
    await prisma.project.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description || null,
        image: data.image || null,
        techStack: data.techStack,
        link: data.link || null,
        isFeatured: data.isFeatured,
      },
    });

    // Refresh halaman admin & utama otomatis!
    revalidatePath("/admin/projects");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal tambah project:", error);
    return { success: false, error: "Gagal menambahkan data project" };
  }
}

// 🟡 2. PUT: Edit Project yang Udah Ada
export async function updateProject(id: string, data: ProjectData) {
  try {
    await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type,
        description: data.description || null,
        image: data.image || null,
        techStack: data.techStack,
        link: data.link || null,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal update project:", error);
    return { success: false, error: "Gagal mengubah data project" };
  }
}

// 🔴 3. DELETE: Ngapus Project
export async function deleteProject(id: string) {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus project:", error);
    return { success: false, error: "Gagal menghapus data project" };
  }
}