'use client';

import { useState } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Download, Briefcase, HeartHandshake, CalendarDays, ExternalLink } from 'lucide-react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Work_Sans } from 'next/font/google';

const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export default function Home() {
  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const [openEventIndex, setOpenEventIndex] = useState<number | null>(null);

  const toggleEvent = (index: number) => {
    setOpenEventIndex(openEventIndex === index ? null : index);
  };

  // UPDATE KONTEN DARI CV
  const eventList = [
    { 
      title: "RDK ITS 1446 H", 
      role: "Wakil Ketua Pelaksana", year: "2024 - 2025", 
      desc: "Memberikan arahan strategis dan mengawasi secara langsung kinerja Unit Ibadah dan Unit Finansial. Bekerja sama dengan Ketua Pelaksana dalam mengelola operasional harian event utama." 
    },
    { 
      title: "Be A Better Muslim II & Ta'aruf Organisasi JMMI", 
      role: "Ketua Pelaksana", year: "2024", 
      desc: "Memimpin secara komprehensif mulai dari tahap konseptualisasi hingga eksekusi program pelatihan kepemimpinan intensif untuk regenerasi pengurus inti organisasi." 
    },
    { 
      title: "Pelatihan Manajerial CSSMoRA ITS", 
      role: "Ketua Pelaksana", year: "2025", 
      desc: "Memimpin konseptualisasi hingga pengeksekusian program pelatihan manajerial yang berfokus pada peningkatan pemahaman tata kelola proyek dan operasional anggota." 
    },
    { 
      title: "Webinar & Free Class Jago Teknik", 
      role: "Ketua Pelaksana", year: "2024", 
      desc: "Memimpin penyelenggaraan rangkaian edukasi publik (Webinar Cloud Computing & AI, Free Class CV), berkolaborasi langsung dengan narasumber profesional." 
    },
    { 
      title: "CSS Fit CSSMoRA ITS", 
      role: "Wakil Ketua Pelaksana", year: "2024", 
      desc: "Mengoordinasikan operasional kegiatan kompetisi olahraga internal lintas jurusan, memfasilitasi program yang meningkatkan engagement dan solidaritas antar anggota." 
    }
  ];

  // UPDATE KONTEN SOSMAS DARI CV
  const sosmasList = [
    {
      title: "Pekan Ormawa Membangun Negeri", year: "2024",
      desc: "Mengeksekusi edukasi literasi finansial syariah kepada warga di daerah pelosok Lamongan. Mendampingi pengembangan UMKM lokal melalui strategi branding dan sertifikasi halal."
    },
    {
      title: "SD Mabadiul Ulum & JMMI Mengajar", year: "2022 - 2024",
      desc: "Mendedikasikan waktu sebagai tenaga pengajar non-formal untuk membimbing, mengedukasi, dan menanamkan nilai moral kepada anak-anak di kawasan marjinal."
    },
    {
      title: "ITS Green Action II BEM ITS", year: "2024",
      desc: "Berpartisipasi aktif dalam inisiatif pelestarian lingkungan hidup dan keberlanjutan ekosistem melalui aksi penanaman mangrove serta pembersihan area pesisir Madura."
    },
    {
      title: "Santunan 1000 Anak Yatim IKA ITS", year: "2024",
      desc: "Bertindak sebagai narahubung utama dalam mengoordinasikan mobilisasi panti asuhan undangan, memastikan kelancaran dan kenyamanan peserta."
    }
  ];

  return (
    <main className={`relative min-h-screen bg-[#FAFAFA] text-slate-800 ${workSans.className} selection:bg-[#FFBD07] selection:text-[#013880] overflow-x-hidden`}>
      
      {/* TECH GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* AMBIENT GLOW ITS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#007BC0]/15 blur-[120px] z-0 pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#FFBD07]/15 blur-[120px] z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        
        {/* Navbar */}
        <nav className="py-8 flex justify-between items-center relative z-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-extrabold text-[#013880] tracking-tighter">Bara.</motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-bold text-slate-400 hover:text-[#FFBD07] cursor-pointer transition-colors uppercase tracking-widest">Contact</motion.div>
        </nav>
        
        {/* HERO SECTION */}
        <section className="pt-12 pb-24 md:pt-16 md:pb-32 flex flex-col-reverse md:flex-row items-center gap-16 md:gap-20 border-b border-slate-200/60">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="flex-1 space-y-8 z-10">
            <p className="text-[#007BC0] font-bold tracking-widest uppercase text-sm drop-shadow-sm">Welcome to my portfolio</p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight h-[150px] md:h-auto">
              Hi, I'm Bara. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013880] to-[#FFBD07]">I build and lead.</span>
            </h1>
            
            <div className="text-xl text-slate-500 leading-relaxed max-w-xl min-h-[60px]">
              <TypeAnimation
                sequence={[
                  'Mahasiswa Sistem Informasi ITS.', 1000, 
                  'Fokus pada Event Management.', 1000, 
                  'Spesialis People Development.', 1000, 
                  'Tech-Savvy System Optimizer.', 1000, 
                  'Welcome to my personal space!', 2000
                ]}
                wrapper="span" speed={50} repeat={Infinity}
              />
            </div>
            
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button className="bg-[#013880] text-white px-8 py-4 rounded-full font-bold hover:bg-[#FFBD07] hover:text-[#013880] hover:shadow-lg hover:shadow-[#FFBD07]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2">
                <Download size={20} /> Download CV
              </button>
              
              <div className="flex gap-3">
                <a href="#" className="p-4 rounded-full bg-blue-50 text-[#013880] hover:bg-[#FFBD07] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-blue-100" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="#" className="p-4 rounded-full bg-blue-50 text-[#013880] hover:bg-[#FFBD07] hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-blue-100" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path><path d="M12 18s-3 2-4 2-3-2-3-2"></path></svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* AREA FOTO PROFIL */}
          <div className="relative z-10 flex-shrink-0 mt-8 md:mt-0">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 md:-inset-8 rounded-full border-2 border-dashed border-[#007BC0]/30 z-0"></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute -inset-8 md:-inset-14 rounded-full border border-[#FFBD07]/40 z-0"></motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="relative w-56 h-56 md:w-80 md:h-80 bg-white rounded-full shadow-2xl border border-white flex-shrink-0 group hover:border-[#FFBD07] transition-colors cursor-pointer overflow-hidden ring-4 ring-slate-50 z-10 mx-auto md:mx-0">
              <Image src="/profile.png" alt="Bara Profile Picture" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30, y: 30 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.8, duration: 0.6, type: "spring" }} className="absolute -bottom-4 left-0 md:-bottom-2 md:-left-12 bg-white/90 backdrop-blur-md px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-xl border border-white/50 flex items-center gap-2 md:gap-3 z-20 hover:scale-105 transition-transform cursor-default">
              <div className="text-xl md:text-2xl">🌟</div>
              <div>
                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Ketua Pelaksana</p>
                <p className="text-xs md:text-sm font-extrabold text-[#013880]">RDK 47 ITS</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -30, y: -30 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 1, duration: 0.6, type: "spring" }} className="absolute top-0 right-0 md:top-4 md:-right-8 bg-white/90 backdrop-blur-md px-3 py-2 md:px-5 md:py-3 rounded-xl md:rounded-2xl shadow-xl border border-white/50 flex items-center gap-2 md:gap-3 z-20 hover:scale-105 transition-transform cursor-default">
              <div className="text-xl md:text-2xl">💻</div>
              <div>
                <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Mahasiswa</p>
                <p className="text-xs md:text-sm font-extrabold text-[#013880]">Sistem Informasi</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 1. KEY LEADERSHIP SECTION */}
        <section className="py-24 border-b border-slate-200/60 overflow-hidden">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex items-center gap-3 mb-16">
            <div className="p-3 bg-blue-50 rounded-xl"><Briefcase size={20} className="text-[#007BC0]" /></div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Key Leadership & Roles</h2>
          </motion.div>
          <div className="space-y-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4">
                <h3 className="text-3xl font-bold text-[#0F172A] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#013880] group-hover:to-[#FFBD07] transition-all duration-300">Ketua Pelaksana RDK 47 ITS</h3>
                <span className="text-slate-500 font-bold text-sm mt-2 md:mt-0 uppercase tracking-widest bg-[#FFBD07]/20 px-3 py-1 rounded-full group-hover:bg-[#FFBD07] group-hover:text-[#013880] transition-colors">2025 - 2026</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-3xl text-lg mb-6">Memimpin dan mengoordinasikan 257 anggota panitia untuk mengeksekusi program Ramadan skala universitas selama 30 hari. Mengimplementasikan Scrum untuk monitoring kinerja dan sukses mengundang Menteri Agama RI.</p>
              <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-[#007BC0] border border-[#007BC0]/30 px-5 py-2.5 rounded-full hover:bg-[#007BC0] hover:text-white transition-all">
                <ExternalLink size={16} /> View Credential
              </a>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4">
                <h3 className="text-3xl font-bold text-[#0F172A] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#013880] group-hover:to-[#FFBD07] transition-all duration-300">Staf Ahli PSDM JMMI ITS</h3>
                <span className="text-slate-500 font-bold text-sm mt-2 md:mt-0 uppercase tracking-widest bg-[#FFBD07]/20 px-3 py-1 rounded-full group-hover:bg-[#FFBD07] group-hover:text-[#013880] transition-colors">2024 - 2025</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-3xl text-lg mb-6">Merancang program pelatihan manajemen dan mengevaluasi kinerja pengurus secara berkala menggunakan sistem rapor berbasis fungsi logika kompleks pada Spreadsheet untuk meningkatkan efisiensi.</p>
              <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-[#007BC0] border border-[#007BC0]/30 px-5 py-2.5 rounded-full hover:bg-[#007BC0] hover:text-white transition-all">
                <ExternalLink size={16} /> View Credential
              </a>
            </motion.div>
            
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="group">
              <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4">
                <h3 className="text-3xl font-bold text-[#0F172A] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#013880] group-hover:to-[#FFBD07] transition-all duration-300">Staf Ahli PSDM CSSMoRA ITS</h3>
                <span className="text-slate-500 font-bold text-sm mt-2 md:mt-0 uppercase tracking-widest bg-[#FFBD07]/20 px-3 py-1 rounded-full group-hover:bg-[#FFBD07] group-hover:text-[#013880] transition-colors">2025 - Sekarang</span>
              </div>
              <p className="text-slate-500 leading-relaxed max-w-3xl text-lg mb-6">Mengelola siklus end-to-end sistem kaderisasi organisasi, memastikan kesiapan serta kualitas kompetensi anggota untuk transisi estafet kepemimpinan pada periode kabinet berikutnya.</p>
              <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-[#007BC0] border border-[#007BC0]/30 px-5 py-2.5 rounded-full hover:bg-[#007BC0] hover:text-white transition-all">
                <ExternalLink size={16} /> View Credential
              </a>
            </motion.div>
          </div>
        </section>

        {/* 2. EVENT MANAGEMENT (HORIZONTAL SLIDER) */}
        <section className="py-24 border-b border-slate-200/60 relative">
          <div className="absolute top-[30%] left-[-20%] w-[50%] h-[50%] rounded-full bg-[#007BC0]/10 blur-[100px] z-0 pointer-events-none"></div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl"><CalendarDays size={20} className="text-[#007BC0]" /></div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Event Management</h2>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden md:block">Swipe to explore →</p>
          </motion.div>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex overflow-x-auto gap-6 pb-8 pt-4 snap-x snap-mandatory relative z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {eventList.map((event, index) => (
              <div key={index} className="min-w-[300px] md:min-w-[400px] snap-center bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-[#007BC0]/30 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <span className="inline-block text-xs font-bold text-[#013880] bg-[#007BC0]/10 px-3 py-1.5 rounded-full border border-[#007BC0]/20 mb-4">{event.year}</span>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-2 group-hover:text-[#013880] transition-colors">{event.title}</h3>
                  <p className="text-sm font-bold text-[#FFBD07] mb-4 uppercase tracking-widest">{event.role}</p>
                  <p className="text-slate-500 leading-relaxed">{event.desc}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#007BC0] transition-colors">
                    <ExternalLink size={16} /> Lihat Bukti 📄
                  </a>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* 3. SOSMAS & PENDIDIKAN (HORIZONTAL SLIDER) */}
        <section className="py-24 border-b border-slate-200/60">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl"><HeartHandshake size={20} className="text-[#007BC0]" /></div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sosmas & Pendidikan</h2>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden md:block">Swipe to explore →</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex overflow-x-auto gap-6 pb-8 pt-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {sosmasList.map((item, index) => (
              <div key={index} className="min-w-[300px] md:min-w-[400px] snap-center bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-[#007BC0]/30 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <span className="inline-block text-xs font-bold text-[#013880] bg-[#007BC0]/10 px-3 py-1.5 rounded-full border border-[#007BC0]/20 mb-4">{item.year}</span>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-4 group-hover:text-[#013880] transition-colors">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#007BC0] transition-colors">
                    <ExternalLink size={16} /> Lihat Bukti 📄
                  </a>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* 4. TECH PROJECTS SECTION */}
        <section className="py-24 overflow-hidden relative">
          <div className="absolute bottom-[0%] right-[-20%] w-[60%] h-[60%] rounded-full bg-[#FFBD07]/15 blur-[120px] z-0 pointer-events-none"></div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="relative z-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-16">Featured Tech Work</h2>
            <div className="group max-w-xl bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 hover:shadow-2xl hover:shadow-[#013880]/10 transition-all duration-500">
              <div className="aspect-[4/3] bg-slate-100 rounded-2xl mb-8 overflow-hidden relative cursor-pointer ring-1 ring-slate-200/50">
                <Image src="/dashboard.png" alt="Personal Desktop Dashboard" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="px-2">
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3 group-hover:text-[#007BC0] transition-colors">BaraDashboard: Personal Workspace</h3>
                <p className="text-slate-500 leading-relaxed mb-6">Aplikasi desktop custom berbasis Electron terintegrasi API real-time untuk pemantauan cuaca, live tracker portofolio saham, jadwal operasional, dan task manager pribadi.</p>
                <div className="flex gap-3 mb-6">
                   <span className="text-xs font-bold text-[#013880] bg-[#007BC0]/10 px-3 py-1.5 rounded-full border border-[#007BC0]/20">Electron</span>
                   <span className="text-xs font-bold text-[#013880] bg-[#007BC0]/10 px-3 py-1.5 rounded-full border border-[#007BC0]/20">API Integration</span>
                </div>
                <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#007BC0] transition-colors">
                  <ExternalLink size={16} /> Link Project 🔗
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="py-12 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-slate-400 text-sm font-medium">© 2026 Bara. Styled with ITS Pride.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-[#FFBD07] transition-colors transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
            <a href="#" className="hover:text-[#FFBD07] transition-colors transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path><path d="M12 18s-3 2-4 2-3-2-3-2"></path></svg></a>
          </div>
        </motion.footer>

      </div>
    </main>
  );
}