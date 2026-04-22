"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// CREATE: Nambah Shortlink Baru
export async function createShortlink(data: { slug: string; url: string }) {
  try {
    // Cek dulu apakah slug/kata kunci udah dipakai (karena slug harus unik)
    const existing = await prisma.shortlink.findUnique({
      where: { slug: data.slug }
    });

    if (existing) {
      return { success: false, error: "Kata kunci (slug) sudah dipakai! Gunakan yang lain." };
    }

    // Kalau aman, simpan ke database
    await prisma.shortlink.create({
      data: {
        slug: data.slug.toLowerCase().trim(), // Pastikan slug huruf kecil & ga ada spasi di ujung
        url: data.url,
      }
    });
    
    revalidatePath("/admin/links"); // Update halaman admin nanti
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan shortlink" };
  }
}

// DELETE: Hapus Shortlink
export async function deleteShortlink(id: string) {
  try {
    await prisma.shortlink.delete({
      where: { id },
    });
    revalidatePath("/admin/links");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Gagal menghapus shortlink" };
  }
}