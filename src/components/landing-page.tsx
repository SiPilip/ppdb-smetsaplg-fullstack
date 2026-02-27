"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Trophy,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Calendar,
  FileText,
  ArrowRight,
  Star,
  Sparkles,
  Menu,
  X,
  Wifi,
  Monitor,
  FlaskConical,
  Gift,
  Handshake,
  Dumbbell,
  Music,
  Bot,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GALLERY_SLIDES = [
  {
    src: "/img/1.png",
    label: "Gedung Sekolah",
    caption: "Lingkungan belajar yang nyaman dan modern",
  },
  {
    src: "/img/2.png",
    label: "Kegiatan Belajar",
    caption: "Laboratorium lengkap untuk pembelajaran praktis",
  },
  {
    src: "/img/3.png",
    label: "Wisuda",
    caption: "Merayakan prestasi dan keberhasilan siswa",
  },
  {
    src: "/img/4.png",
    label: "Olahraga & Ekskul",
    caption: "Pengembangan bakat dan karakter melalui sport",
  },
  {
    src: "/img/5.png",
    label: "Perpustakaan",
    caption: "Ribuan koleksi buku untuk mendukung literasi",
  },
];

const STATS = [
  { value: 55, suffix: "+", label: "Tahun Berdiri", icon: Star },
  { value: 1200, suffix: "+", label: "Siswa Aktif", icon: Users },
  { value: 98, suffix: "%", label: "Kelulusan UN", icon: GraduationCap },
  { value: 19, suffix: "", label: "Ekskul Tersedia", icon: Trophy },
];

const FACILITIES = [
  { icon: Monitor, label: "Ruangan Belajar Full AC" },
  { icon: FlaskConical, label: "Lab IPA" },
  { icon: Globe, label: "Lab Bahasa" },
  { icon: Monitor, label: "Lab Komputer" },
  { icon: BookOpen, label: "Perpustakaan" },
  { icon: Users, label: "UKS" },
  { icon: Wifi, label: "WiFi Gratis" },
  { icon: Monitor, label: "Proyektor & Smart TV" },
];

const EXTRACURRICULARS = [
  { name: "Basket", icon: Dumbbell, category: "Olahraga" },
  { name: "Bola Voli", icon: Dumbbell, category: "Olahraga" },
  { name: "Futsal", icon: Dumbbell, category: "Olahraga" },
  { name: "Paskibra", icon: Users, category: "Non-akademik" },
  { name: "Bulu Tangkis", icon: Dumbbell, category: "Olahraga" },
  { name: "Paduan Suara", icon: Music, category: "Seni" },
  { name: "Modern Dance", icon: Music, category: "Seni" },
  { name: "Jurnalistik", icon: FileText, category: "Non-akademik" },
  { name: "PMR", icon: Users, category: "Non-akademik" },
  { name: "Musik", icon: Music, category: "Seni" },
  { name: "Olimpiade Matematika", icon: Trophy, category: "Akademik" },
  { name: "Olimpiade Fisika", icon: Trophy, category: "Akademik" },
  { name: "Olimpiade Biologi", icon: Trophy, category: "Akademik" },
  { name: "Olimpiade Kimia", icon: Trophy, category: "Akademik" },
  { name: "Olimpiade Geografi", icon: Trophy, category: "Akademik" },
  { name: "Olimpiade Ekonomi", icon: Trophy, category: "Akademik" },
  { name: "English Club", icon: Globe, category: "Akademik" },
  { name: "Robotik & AI", icon: Bot, category: "Teknologi" },
  { name: "Computer Application", icon: Bot, category: "Teknologi" },
];

const BENEFITS = [
  {
    icon: Gift,
    title: "Atribut Sekolah Gratis",
    desc: "Dapatkan bahan jas, tas sekolah, dan atribut sekolah secara gratis untuk siswa baru.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: Trophy,
    title: "Bebas Dana Partisipasi",
    desc: "Peringkat 1 sampai 5 bebas Dana Partisipasi Pendidikan sebagai penghargaan prestasi.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Handshake,
    title: "Kemitraan Internasional",
    desc: "Bekerjasama dengan Jeonju Vision College Korea, RAPP, dan beberapa Perguruan Tinggi terkemuka.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Bot,
    title: "Teknologi Terkini",
    desc: "Fasilitas Robotik & AI, Lab Komputer, Smart TV, dan WiFi gratis untuk mendukung pembelajaran modern.",
    color: "from-violet-500 to-purple-600",
  },
];

const TIMELINE = [
  {
    wave: "Gelombang I",
    date: "1 Maret – 31 Oktober 2026",
    status: "open",
  },
  {
    wave: "Gelombang II",
    date: "1 November – 31 Desember 2026",
    status: "pending",
  },
  {
    wave: "Gelombang III",
    date: "1 Januari – 28 Februari 2027",
    status: "pending",
  },
  {
    wave: "Gelombang IV",
    date: "1 Maret – 30 Juni 2027",
    status: "pending",
  },
];

const REQUIREMENTS = [
  "Mengisi Formulir Pendaftaran",
  "Menyerahkan FC Kartu Keluarga",
  "Menyerahkan FC Akte Lahir",
];

const CONTACTS = [
  { name: "Rotua Napitupulu", phone: "085709306252" },
  { name: "Angelina", phone: "082288189413" },
  { name: "Ruthmaida", phone: "08127326176" },
  { name: "Nanci Sianturi", phone: "0895413941549" },
];

const PARTNERS = [
  { name: "RAPP", desc: "PT Riau Andalan Pulp and Paper" },
  {
    name: "Jeonju Vision College",
    desc: "Perguruan Tinggi Internasional Korea",
  },
  {
    name: "Perguruan Tinggi",
    desc: "Kerjasama dengan beberapa Perguruan Tinggi terkemuka",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Beranda", href: "#hero" },
    { label: "Galeri", href: "#gallery" },
    { label: "Keunggulan", href: "#features" },
    { label: "Timeline PPDB", href: "#timeline" },
    { label: "Syarat", href: "#requirements" },
    { label: "Kontak", href: "#contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg border-b border-white/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/logo.svg"
                alt="Logo SMA Methodist 1"
                fill
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <p
                className={`font-bold leading-tight text-sm md:text-base ${
                  scrolled
                    ? "text-slate-900 dark:text-white"
                    : "text-white drop-shadow-md"
                }`}
              >
                SMA Methodist 1
              </p>
              <p
                className={`text-xs leading-tight ${
                  scrolled
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-yellow-300 drop-shadow-md"
                }`}
              >
                Palembang
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/20 ${
                  scrolled
                    ? "text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              Daftar Sekarang
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                scrolled ? "text-slate-700" : "text-white"
              }`}
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 mt-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-900 font-bold px-4 py-3 rounded-xl text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Daftar Sekarang
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/school-bg.png"
          alt="SMA Methodist 1 Palembang"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-slate-900/80 to-indigo-900/85" />
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-5xl mx-auto py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4" />
          PPDB Tahun Ajaran 2025/2026 Telah Dibuka!
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4"
        >
          <span className="block">Selamat Datang di</span>
          <span className="block bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            SMA Methodist 1
          </span>
          <span className="block text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 mt-1">
            Palembang
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Membangun generasi unggul berakhlak mulia. Daftarkan putra-putri Anda
          sekarang dan raih masa depan gemilang bersama kami.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 font-black px-8 py-4 rounded-2xl text-lg shadow-2xl hover:shadow-yellow-400/30 transition-all duration-200 hover:-translate-y-1"
          >
            <GraduationCap className="w-6 h-6" />
            Daftar Sekarang
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#gallery"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl text-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1"
          >
            Lihat Galeri
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-1 text-white/50">
            <p className="text-xs font-medium">Scroll ke bawah</p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative py-16 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="text-center text-white"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/15 rounded-xl mb-3">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-4xl md:text-5xl font-black mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-white/80 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const paginate = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent(
      (prev) => (prev + dir + GALLERY_SLIDES.length) % GALLERY_SLIDES.length,
    );
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => paginate(1), 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paginate]);

  const resetTimer = (dir: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    paginate(dir);
    timerRef.current = setInterval(() => paginate(1), 5000);
  };

  return (
    <section id="gallery" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Galeri Sekolah ✦
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Keindahan{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lingkungan Belajar
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Fasilitas modern yang mendukung tumbuh kembang siswa secara optimal
          </p>
        </motion.div>

        {/* Main carousel */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl h-64 sm:h-96 md:h-[520px] bg-slate-200 dark:bg-slate-800">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={GALLERY_SLIDES[current].src}
                alt={GALLERY_SLIDES[current].label}
                fill
                className="object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-block bg-blue-500/80 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    {GALLERY_SLIDES[current].label}
                  </span>
                  <p className="text-lg sm:text-xl font-bold">
                    {GALLERY_SLIDES[current].caption}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Arrows */}
          <button
            onClick={() => resetTimer(-1)}
            aria-label="Previous"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => resetTimer(1)}
            aria-label="Next"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide counter */}
          <div className="absolute top-4 right-5 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {current + 1} / {GALLERY_SLIDES.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 sm:gap-3 mt-4 justify-center flex-wrap">
          {GALLERY_SLIDES.map((slide, i) => (
            <button
              key={i}
              onClick={() => {
                const dir = i > current ? 1 : -1;
                if (timerRef.current) clearInterval(timerRef.current);
                setDirection(dir);
                setCurrent(i);
                timerRef.current = setInterval(() => paginate(1), 5000);
              }}
              className={`relative w-14 h-10 sm:w-20 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 ${
                i === current
                  ? "ring-3 ring-blue-500 ring-offset-2 scale-105"
                  : "opacity-60 hover:opacity-90 hover:scale-105"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.label}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PosterSection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 text-white"
          >
            <span className="inline-block text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-3">
              ✦ Informasi PPDB ✦
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 leading-tight">
              Poster Resmi{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                PPDB 2025/2026
              </span>
            </h2>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Segera daftarkan putra-putri Anda. Tempat terbatas! Bergabunglah
              bersama ribuan alumni sukses SMA Methodist 1 Palembang dan raih
              masa depan yang lebih cerah.
            </p>

            <div className="space-y-3 mb-10">
              {[
                "Pendaftaran Online 24 Jam",
                "Proses Seleksi Transparan",
                "Beasiswa Bagi Siswa Berprestasi",
                "Dukungan Konseling & Bimbingan Karir",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/85 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 font-black px-7 py-4 rounded-2xl shadow-xl hover:shadow-yellow-400/30 transition-all duration-200 hover:-translate-y-1"
              >
                Daftar Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#requirements"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-4 rounded-2xl transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                Lihat Persyaratan
              </a>
            </div>
          </motion.div>

          {/* Poster image */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-yellow-400/30 to-blue-500/20 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Image
                  src="/img/poster-ppdb2.png"
                  alt="Poster PPDB 2025/2026 SMA Methodist 1 Palembang"
                  width={480}
                  height={680}
                  className="w-full h-auto"
                />
              </div>
              {/* Badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900 font-black text-xs px-3 py-1.5 rounded-full shadow-lg">
                TERBARU!
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 sm:py-28 bg-white dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Yang Kamu Dapatkan ✦
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Keistimewaan{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Methodist 1
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            Bergabunglah dan nikmati berbagai keistimewaan eksklusif sebagai
            siswa SMA Methodist 1 Palembang
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {BENEFITS.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className="group bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${f.color} rounded-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection() {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Fasilitas ✦
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Fasilitas{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lengkap & Modern
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Semua fasilitas dirancang untuk mendukung proses belajar mengajar
            yang efektif dan menyenangkan
          </p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {FACILITIES.map((fac, i) => (
            <motion.div
              key={fac.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 shadow-md border border-blue-100 dark:border-slate-800 flex flex-col items-center text-center gap-3 cursor-default"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow">
                <fac.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-snug">
                {fac.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EkstrakurikulerSection() {
  const categories = [
    "Semua",
    "Olahraga",
    "Akademik",
    "Seni",
    "Teknologi",
    "Non-akademik",
  ];
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filtered =
    activeCategory === "Semua"
      ? EXTRACURRICULARS
      : EXTRACURRICULARS.filter((e) => e.category === activeCategory);

  const categoryColors: Record<string, string> = {
    Olahraga: "from-orange-500 to-red-500",
    Akademik: "from-blue-500 to-indigo-600",
    Seni: "from-pink-500 to-rose-600",
    Teknologi: "from-violet-500 to-purple-600",
    "Non-akademik": "from-emerald-500 to-teal-600",
  };

  return (
    <section id="ekskul" className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Ekstrakurikuler ✦
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            19 Pilihan{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ekstrakurikuler
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Temukan bakat dan minatmu melalui berbagai kegiatan ekstra yang seru
            dan bermanfaat
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((ekskul, i) => (
              <motion.div
                key={ekskul.name}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-md flex flex-col items-center gap-2.5 text-center cursor-default"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${categoryColors[ekskul.category] ?? "from-slate-400 to-slate-600"} rounded-xl flex items-center justify-center shadow`}
                >
                  <ekskul.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-snug">
                  {ekskul.name}
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                  {ekskul.category}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section
      id="timeline"
      className="py-20 sm:py-28 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Jadwal PPDB ✦
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Gelombang{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Pendaftaran
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
            PPDB dibuka dalam 4 gelombang — daftar lebih awal, peluang lebih
            besar!
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-400 to-slate-200 dark:to-slate-700" />

          <div className="space-y-5">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 sm:gap-6"
              >
                {/* Dot */}
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black z-10 relative shadow-md ${
                      item.status === "open"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                        : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400"
                    }`}
                  >
                    {item.status === "open" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-md border mb-2 ${
                    item.status === "open"
                      ? "border-blue-200 dark:border-blue-900 ring-1 ring-blue-500/20"
                      : "border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-xl">
                      {item.wave}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        item.status === "open"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {item.status === "open"
                        ? "🟢 Sedang Dibuka"
                        : "Segera Dibuka"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RequirementsSection() {
  return (
    <section
      id="requirements"
      className="py-20 sm:py-28 bg-white dark:bg-slate-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
              ✦ Persyaratan ✦
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Dokumen{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Yang Diperlukan
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
              Siapkan seluruh dokumen berikut sebelum memulai proses pendaftaran
              secara online.
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-blue-500/30 transition-all duration-200 hover:-translate-y-1"
            >
              Mulai Pendaftaran
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 rounded-3xl p-6 sm:p-8 border border-blue-100 dark:border-blue-900"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-500 rounded-xl">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Checklist Dokumen
              </h3>
            </div>
            <ul className="space-y-3">
              {REQUIREMENTS.map((req, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-3 text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base leading-snug">
                    {req}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PartnersSection() {
  return (
    <section className="py-16 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-block text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Kerjasama ✦
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Bekerjasama Dengan
          </h2>
        </motion.div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {PARTNERS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950 border border-blue-100 dark:border-blue-900 rounded-2xl px-8 py-6 text-center shadow-md max-w-xs w-full"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <p className="font-black text-slate-900 dark:text-white text-base sm:text-lg mb-1">
                {p.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section
      id="contact"
      className="py-20 sm:py-28 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-2">
            ✦ Hubungi Kami ✦
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
            Ada Pertanyaan?{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Kami Siap Membantu
            </span>
          </h2>
          <p className="text-white/60 text-lg">
            Hubungi panitia PPDB langsung melalui nomor berikut
          </p>
        </motion.div>

        {/* Panitia cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {CONTACTS.map((c, i) => (
            <motion.a
              key={c.name}
              href={`https://wa.me/62${c.phone.replace(/^0/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 rounded-2xl p-6 transition-all duration-200 block"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl mb-4 shadow">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <p className="font-bold text-white text-base mb-1">{c.name}</p>
              <p className="text-white/60 text-sm font-medium">{c.phone}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                💬 Chat WhatsApp
              </span>
            </motion.a>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/30 rounded-3xl p-8 sm:p-12 text-center"
        >
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
            Siap Bergabung Bersama Kami?
          </h3>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Jangan lewatkan kesempatan emas ini. Segera daftar sebelum tempat
            habis!
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-900 font-black px-8 py-4 rounded-2xl text-lg shadow-2xl hover:shadow-yellow-400/30 transition-all duration-200 hover:-translate-y-1"
          >
            <Sparkles className="w-6 h-6" />
            Daftar Sekarang!
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                SMA Methodist 1 Palembang
              </p>
              <p className="text-slate-500 text-xs">PPDB Online System</p>
            </div>
          </div>
          <p className="text-xs text-center sm:text-right">
            © {new Date().getFullYear()} SMA Methodist 1 Palembang. All rights
            reserved.
            <br />
            <span className="text-slate-600">
              Sistem PPDB Online — Untuk informasi lebih lanjut hubungi panitia.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <GallerySection />
      <PosterSection />
      <FeaturesSection />
      <FacilitiesSection />
      <EkstrakurikulerSection />
      <TimelineSection />
      <RequirementsSection />
      <PartnersSection />
      <ContactSection />
      <Footer />
    </>
  );
}
