"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface EducationData {
  institution: string;
  major: string;
  degree: string;
  year: string;
  description?: string;
}

// 🟢 1. POST
export async function createEducation(data: EducationData) {
  try {
    await prisma.education.create({
      data: {
        institution: data.institution,
        major: data.major,
        degree: data.degree,
        year: data.year,
        description: data.description || null,
      },
    });

    revalidatePath("/admin/education"); // Jaga-jaga kalo nanti dibikinin UI-nya
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal tambah education:", error);
    return { success: false, error: "Gagal menambahkan data pendidikan" };
  }
}

// 🟡 2. PUT
export async function updateEducation(id: string, data: EducationData) {
  try {
    await prisma.education.update({
      where: { id },
      data: {
        institution: data.institution,
        major: data.major,
        degree: data.degree,
        year: data.year,
        description: data.description || null,
      },
    });

    revalidatePath("/admin/education");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal update education:", error);
    return { success: false, error: "Gagal mengubah data pendidikan" };
  }
}

// 🔴 3. DELETE
export async function deleteEducation(id: string) {
  try {
    await prisma.education.delete({
      where: { id },
    });

    revalidatePath("/admin/education");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Gagal hapus education:", error);
    return { success: false, error: "Gagal menghapus data pendidikan" };
  }
}