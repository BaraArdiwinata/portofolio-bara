'use client';

import { useState, useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { Download, Briefcase, HeartHandshake, CalendarDays, ExternalLink, ChevronLeft, ChevronRight, ArrowRight, Code, Zap, FolderDot } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { Work_Sans } from 'next/font/google';

const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

// BIKIN KONTRAK DATA (PROPS)
interface HomeClientProps {
  leadershipExps: any[];
  eventExps: any[];
  sosmasExps: any[];
  masterpieceProjects: any[];
  archiveProjects: any[];
}

export default function HomeClient({ 
  leadershipExps, 
  eventExps, 
  sosmasExps, 
  masterpieceProjects, 
  archiveProjects 
}: HomeClientProps) {
  const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const [eventIndex, setEventIndex] = useState(0);
  const [sosmasIndex, setSosmasIndex] = useState(0);

  // LOGIKA AUTO-PLAY SLIDER (Cek length biar ga error kalo database kosong)
  useEffect(() => {
    if (eventExps.length === 0) return;
    const timer = setInterval(() => setEventIndex((prev) => (prev + 1) % eventExps.length), 5000);
    return () => clearInterval(timer);
  }, [eventExps.length]);

  useEffect(() => {
    if (sosmasExps.length === 0) return;
    const timer = setInterval(() => setSosmasIndex((prev) => (prev + 1) % sosmasExps.length), 5000);
    return () => clearInterval(timer);
  }, [sosmasExps.length]);

  const getCardVariant = (index: number, currentIndex: number, total: number) => {
    if (total === 0) return {};
    let offset = index - currentIndex;
    if (offset < -Math.floor(total / 2)) offset += total;
    if (offset > Math.floor(total / 2)) offset -= total;

    if (offset === 0) return { x: '0%', scale: 1, opacity: 1, zIndex: 30 };
    else if (offset === 1) return { x: '90%', scale: 0.85, opacity: 0.5, zIndex: 20 };
    else if (offset === -1) return { x: '-90%', scale: 0.85, opacity: 0.5, zIndex: 20 };
    else return { x: offset > 0 ? '150%' : '-150%', scale: 0.5, opacity: 0, zIndex: 0 };
  };

  return (
    <main className={`relative min-h-screen bg-[#FAFAFA] text-slate-800 ${workSans.className} selection:bg-[#FFBD07] selection:text-[#013880] overflow-x-hidden`}>
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div style={{ willChange: 'transform' }} className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#007BC0]/15 blur-[120px] z-0 pointer-events-none transform-gpu"></div>
      <div style={{ willChange: 'transform' }} className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-[#FFBD07]/15 blur-[120px] z-0 pointer-events-none transform-gpu"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12">
        {/* Navbar */}
        <nav className="py-8 flex justify-between items-center relative z-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-extrabold text-[#013880] tracking-tighter">Bara.</motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-bold text-slate-400 hover:text-[#FFBD07] cursor-pointer transition-colors uppercase tracking-widest">Contact</motion.div>
        </nav>
        
        {/* HERO SECTION */}
        <section className="pt-12 pb-24 md:pt-16 md:pb-32 flex flex-col-reverse md:flex-row items-center gap-16 md:gap-20 border-b border-slate-200/60 relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUpVariant} className="flex-1 space-y-8 z-10">
            <p className="text-[#007BC0] font-bold tracking-widest uppercase text-sm drop-shadow-sm">Selamat Datang di Portofolio Saya</p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#0F172A] leading-[1.1] tracking-tight h-[150px] md:h-auto">
              Halo, aku Bara. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#013880] to-[#FFBD07]">Membangun sistem, memimpin tim.</span>
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
              <a href="/CV_Bara_Ardiwinata.pdf" target="_blank" rel="noopener noreferrer" className="bg-[#013880] text-white px-8 py-4 rounded-full font-bold hover:bg-[#FFBD07] hover:text-[#013880] hover:shadow-lg hover:shadow-[#FFBD07]/30 transition-all flex items-center gap-2 w-fit">
                <Download size={20} /> Download CV
              </a>
              <div className="flex gap-3">
                <a href="https://www.linkedin.com/in/bara-ardiwinata/" target='_blank' rel="noopener noreferrer" className="p-4 rounded-full bg-blue-50 text-[#013880] hover:bg-[#FFBD07] hover:shadow-lg transition-all border border-blue-100" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
                <a href="https://github.com/BaraArdiwinata" target='_blank' rel="noopener noreferrer" className="p-4 rounded-full bg-blue-50 text-[#013880] hover:bg-[#FFBD07] hover:shadow-lg transition-all border border-blue-100" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path><path d="M12 18s-3 2-4 2-3-2-3-2"></path></svg>
                </a>
              </div>
            </div>
          </motion.div>
          <div className="relative z-10 flex-shrink-0 mt-8 md:mt-0">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 md:-inset-8 rounded-full border-2 border-dashed border-[#007BC0]/30 z-0"></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute -inset-8 md:-inset-14 rounded-full border border-[#FFBD07]/40 z-0"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative w-56 h-56 md:w-80 md:h-80 bg-white rounded-full shadow-2xl border border-white flex-shrink-0 group overflow-hidden ring-4 ring-slate-50 z-10 mx-auto md:mx-0">
              <Image src="/profile.png" alt="Bara Profile" fill priority sizes="(max-width: 768px) 224px, 320px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            </motion.div>
          </div>
        </section>

        {/* 1. LEADERSHIP SECTION (DYNAMIC DARI DATABASE) */}
        <section className="py-24 border-b border-slate-200/60 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex items-center gap-3 mb-16">
            <div className="p-3 bg-blue-50 rounded-xl"><Briefcase size={20} className="text-[#007BC0]" /></div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pengalaman Leadership</h2>
          </motion.div>
          <div className="space-y-16">
            {leadershipExps.length === 0 && <p className="text-slate-400">Belum ada data leadership.</p>}
            {leadershipExps.map((exp) => (
              <motion.div key={exp.id} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="group">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-4">
                  <h3 className="text-3xl font-bold text-[#0F172A] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#013880] group-hover:to-[#FFBD07] transition-all">{exp.role} {exp.title}</h3>
                  <span className="text-slate-500 font-bold text-sm mt-2 md:mt-0 uppercase tracking-widest bg-[#FFBD07]/20 px-3 py-1 rounded-full group-hover:bg-[#FFBD07] group-hover:text-[#013880] transition-colors">{exp.year}</span>
                </div>
                <p className="text-slate-500 leading-relaxed max-w-3xl text-lg mb-6 whitespace-pre-wrap">{exp.description}</p>
                {exp.link && (
                  <a href={exp.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#007BC0] border border-[#007BC0]/30 px-5 py-2.5 rounded-full hover:bg-[#007BC0] hover:text-white transition-all">
                    <ExternalLink size={16} /> View Credential
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2. EVENT MANAGEMENT (DYNAMIC 3D CAROUSEL) */}
        <section className="py-24 border-b border-slate-200/60 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl"><CalendarDays size={20} className="text-[#007BC0]" /></div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manajemen Event</h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden md:block">Auto-play & Interactive →</p>
              <div className="flex gap-2">
                <button onClick={() => setEventIndex((prev) => (prev - 1 + eventExps.length) % eventExps.length)} className="p-2 rounded-full border border-slate-200 text-slate-400 hover:bg-[#FFBD07] hover:text-[#013880] transition-all z-40"><ChevronLeft size={18} /></button>
                <button onClick={() => setEventIndex((prev) => (prev + 1) % eventExps.length)} className="p-2 rounded-full border border-slate-200 text-slate-400 hover:bg-[#FFBD07] hover:text-[#013880] transition-all z-40"><ChevronRight size={18} /></button>
              </div>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="relative w-full h-[450px] flex justify-center items-center z-10">
            {eventExps.length === 0 ? <p className="text-slate-400 text-center">Belum ada data event.</p> : eventExps.map((event, index) => {
              const variant = getCardVariant(index, eventIndex, eventExps.length);
              return (
                <motion.div key={event.id} animate={variant} transition={{ duration: 0.6 }} onClick={() => setEventIndex(index)} className="absolute w-[320px] md:w-[400px] h-[380px] md:h-[400px] bg-white/90 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200/60 shadow-xl flex flex-col justify-between cursor-pointer">
                  <div>
                    <span className="inline-block text-xs font-bold text-[#013880] bg-[#007BC0]/10 px-3 py-1.5 rounded-full mb-4">{event.year}</span>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-2">{event.title}</h3>
                    <p className="text-sm font-bold text-[#FFBD07] mb-4 uppercase">{event.role}</p>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base line-clamp-4">{event.description}</p>
                  </div>
                  {event.link && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <a href={event.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#007BC0] z-50 relative"><ExternalLink size={16} /> Lihat Bukti 📄</a>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* 3. SOSMAS SECTION (DYNAMIC 3D CAROUSEL) */}
        <section className="py-24 border-b border-slate-200/60 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl"><HeartHandshake size={20} className="text-[#007BC0]" /></div>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sosial Masyarakat & Pendidikan</h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest hidden md:block">Auto-play & Interactive →</p>
              <div className="flex gap-2">
                <button onClick={() => setSosmasIndex((prev) => (prev - 1 + sosmasExps.length) % sosmasExps.length)} className="p-2 rounded-full border border-slate-200 text-slate-400 hover:bg-[#FFBD07] transition-all z-40"><ChevronLeft size={18} /></button>
                <button onClick={() => setSosmasIndex((prev) => (prev + 1) % sosmasExps.length)} className="p-2 rounded-full border border-slate-200 text-slate-400 hover:bg-[#FFBD07] transition-all z-40"><ChevronRight size={18} /></button>
              </div>
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="relative w-full h-[450px] flex justify-center items-center z-10">
            {sosmasExps.length === 0 ? <p className="text-slate-400 text-center">Belum ada data sosmas.</p> : sosmasExps.map((item, index) => {
              const variant = getCardVariant(index, sosmasIndex, sosmasExps.length);
              return (
                <motion.div key={item.id} animate={variant} transition={{ duration: 0.6 }} onClick={() => setSosmasIndex(index)} className="absolute w-[320px] md:w-[400px] h-[380px] md:h-[400px] bg-white/90 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200/60 shadow-xl flex flex-col justify-between cursor-pointer">
                  <div>
                    <span className="inline-block text-xs font-bold text-[#013880] bg-[#007BC0]/10 px-3 py-1.5 rounded-full mb-4">{item.year}</span>
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base line-clamp-4">{item.description}</p>
                  </div>
                  {item.link && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#007BC0] z-50 relative"><ExternalLink size={16} /> Lihat Bukti 📄</a>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* 4. MASTERPIECE SECTION (DYNAMIC BENTO GRID) */}
        <section className="py-24 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="relative z-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-16 relative">Project Unggulan</h2>
            {masterpieceProjects.length === 0 && <p className="text-slate-400 mb-8">Belum ada data masterpiece.</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8 relative z-10">
              <div className="group bg-gradient-to-br from-[#013880] to-[#007BC0] rounded-[2rem] p-8 md:col-span-1 border border-[#007BC0]/20 shadow-lg flex flex-col justify-between overflow-hidden relative">
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Code size={140} className="text-white" /></div>
                <div>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-1">SI ITS / Tech</p>
                    <h3 className="text-2xl font-extrabold text-white tracking-tighter leading-tight group-hover:scale-105 transition-transform">Master<br />Piece.</h3>
                </div>
                <p className="text-xs text-white/80 leading-relaxed mt-12">Showcasing my best technical creations.</p>
              </div>

              {masterpieceProjects.slice(0, 1).map((proj) => (
                <div key={proj.id} className="group bg-white/90 backdrop-blur-md rounded-[2rem] border border-slate-200/60 shadow-lg transition-all duration-300 overflow-hidden flex flex-col md:col-span-3 hover:ring-1 hover:ring-[#007BC0]/30">
                  {proj.image && (
                    <div className="aspect-[21/9] md:aspect-video bg-slate-100 overflow-hidden relative cursor-pointer border-b border-slate-100">
                      <Image src={proj.image} alt={proj.title} fill sizes="(max-width: 768px) 100vw, 75vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"><Zap size={20} className="text-[#FFBD07]" /></div>
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <span className="inline-block text-xs font-bold text-[#FFBD07] mb-2 uppercase tracking-widest">{proj.type}</span>
                      <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2 group-hover:text-[#013880]">{proj.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-sm line-clamp-2">{proj.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-fit">
                      <div className="flex gap-2 flex-wrap">
                        {proj.techStack.map((tech: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold text-[#013880] bg-[#007BC0]/10 px-2 py-1 rounded-full border border-[#007BC0]/20">{tech}</span>
                        ))}
                      </div>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#007BC0] border border-[#007BC0]/30 px-4 py-2 rounded-full transition-all hover:bg-blue-50 mt-auto">Live Preview <ArrowRight size={14} /></a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {masterpieceProjects.slice(1, 2).map((proj) => (
              <div key={proj.id} className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
                <div className="group bg-white/90 backdrop-blur-md rounded-[2rem] border border-slate-200/60 shadow-lg overflow-hidden flex flex-col md:col-span-3 hover:ring-1 hover:ring-[#FFBD07]/30">
                  <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 h-full items-center">
                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="inline-block text-xs font-bold text-[#FFBD07] mb-2 uppercase tracking-widest">{proj.type}</span>
                        <h3 className="text-xl md:text-2xl font-bold text-[#0F172A] mb-2 group-hover:text-[#FFBD07]">{proj.title}</h3>
                        <p className="text-slate-500 leading-relaxed text-sm">{proj.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {proj.techStack.map((tech: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold text-[#013880] bg-[#FFBD07]/20 px-3 py-1.5 rounded-full border border-[#FFBD07]/30">{tech}</span>
                        ))}
                      </div>
                    </div>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="w-full md:w-48 h-32 md:h-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-[#FFBD07]/5 transition-colors">
                        <div className="absolute inset-0 flex items-center justify-center opacity-20"><Code size={80} className="text-[#FFBD07]" /></div>
                        <span className="relative z-10 font-bold text-[#013880] text-sm flex items-center gap-2"><ExternalLink size={16}/> View Logic</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="group bg-white/90 backdrop-blur-md rounded-[2rem] p-8 md:col-span-1 border border-slate-200/60 shadow-lg flex flex-col justify-between hover:ring-1 hover:ring-[#007BC0]/30">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 group-hover:rotate-12 transition-transform"><FolderDot size={20} className="text-[#007BC0]" /></div>
                    <h4 className="text-sm font-bold text-slate-500 mt-6">Versatility</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mb-4 mt-2">Bridging the gap between UI/UX design and logical automation.</p>
                    <div className="text-[8px] text-white bg-slate-400 group-hover:bg-[#007BC0] px-2 py-1 rounded-full w-fit transition-colors">My Focus</div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* 5. ARCHIVE SECTION (DYNAMIC GRID) */}
        <section className="py-24 border-t border-slate-200/60 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant} className="relative z-10">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12 text-center">Arsip Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {archiveProjects.length === 0 && <p className="text-slate-400 text-center col-span-3">Belum ada arsip project.</p>}
              {archiveProjects.map((proj) => (
                <div key={proj.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 hover:shadow-xl hover:border-[#007BC0]/30 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-[#007BC0] group-hover:bg-[#007BC0] group-hover:text-white transition-colors"><FolderDot size={18} /></div>
                    {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} className="text-slate-300 hover:text-[#007BC0] transition-colors" /></a>}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#007BC0] transition-colors">{proj.title}</h3>
                  <p className="text-xs font-bold text-[#FFBD07] mb-4">{proj.type}</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {proj.techStack.map((t: string, i: number) => (
                      <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* FOOTER */}
        <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="py-12 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
          <p className="text-slate-400 text-sm font-medium">© 2026 Bara Ardiwinata</p>
        </motion.footer>

      </div>
    </main>
  );
}