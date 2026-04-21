"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Tipe data buat nangkep inputan form nanti
export interface ExperienceData {
  title: string;
  role: string;
  category: string;
  year: string;
  description: string;
  link?: string;
}

// 🟢 1. POST: Nambah Pengalaman Baru
export async function createExperience(data: ExperienceData) {
  try {
    await prisma.experience.create({
      data: {
        title: data.title,
        role: data.role,
        category: data.category,
        year: data.year,
        description: data.description,
        link: data.link || null,
      },
    });

    // Refresh halaman admin & halaman utama otomatis tanpa reload browser!
    revalidatePath("/admin/experiences");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal tambah data:", error);
    return { success: false, error: "Gagal menambahkan data pengalaman" };
  }
}

// 🟡 2. PUT: Edit Pengalaman yang Udah Ada
export async function updateExperience(id: string, data: ExperienceData) {
  try {
    await prisma.experience.update({
      where: { id },
      data: {
        title: data.title,
        role: data.role,
        category: data.category,
        year: data.year,
        description: data.description,
        link: data.link || null,
      },
    });

    revalidatePath("/admin/experiences");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal update data:", error);
    return { success: false, error: "Gagal mengubah data pengalaman" };
  }
}

// 🔴 3. DELETE: Ngapus Pengalaman
export async function deleteExperience(id: string) {
  try {
    await prisma.experience.delete({
      where: { id },
    });

    revalidatePath("/admin/experiences");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus data:", error);
    return { success: false, error: "Gagal menghapus data pengalaman" };
  }
}