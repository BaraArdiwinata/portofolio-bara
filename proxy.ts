import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Kita bikin Surat Izin Khusus buat halaman Finance
const isPublicRoute = createRouteMatcher(['/admin/finance']);

// 2. Aturan lama: semua halaman /admin/... lainnya tetep dikunci
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 3. Kalau Satpam lihat lu mau ke /admin/finance, biarin lewat tanpa login!
  if (isPublicRoute(req)) {
    return;
  }

  // 4. Kalau lu mau ke halaman admin lain, baru disuruh login
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};