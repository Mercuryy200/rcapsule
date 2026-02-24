"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Download,
  Palette,
  Tags,
  TrendingUp,
  Calendar,
  Chrome,
  Import,
  FolderOpen,
  Shirt,
} from "lucide-react";

import { Container } from "@/components/ui/container";
import { DSButton } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "@/components/ui/motion";

/* ========================================
   UTILITY: Count-up animation hook
   ======================================== */
function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return { count, ref };
}

/* ========================================
   CHROME ICON (inline SVG)
   ======================================== */
const ChromeIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    className={className}
    fill="none"
    height={size}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width={size}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
);

/* ========================================
   SECTION 1: HERO
   ======================================== */
function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const card1Y = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col items-center justify-center min-h-screen pt-20 md:pt-24 pb-16 md:pb-24 px-4 md:px-6 text-center overflow-hidden"
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--heroui-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--heroui-foreground)) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      {/* Floating fashion card placeholders */}
      <motion.div
        className="absolute top-[15%] -left-8 md:left-[5%] w-32 h-44 md:w-40 md:h-56 border border-default-200 bg-default-50 opacity-20 hidden md:block"
        style={{ y: card1Y, rotate: -12 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Shirt className="w-12 h-12 text-default-300" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[25%] -right-4 md:right-[8%] w-28 h-40 md:w-36 md:h-48 border border-default-200 bg-default-50 opacity-20 hidden md:block"
        style={{ y: card2Y, rotate: 8 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Shirt className="w-10 h-10 text-default-300" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[20%] left-[12%] w-24 h-32 md:w-32 md:h-44 border border-default-200 bg-default-50 opacity-15 hidden lg:block"
        style={{ y: card3Y, rotate: -5 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Shirt className="w-8 h-8 text-default-300" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate="visible"
        className="max-w-5xl mx-auto z-10"
        initial="hidden"
        variants={staggerContainer}
      >
        <motion.h1
          className="text-[clamp(3rem,8vw,7rem)] font-black uppercase tracking-tighter italic leading-[0.9] mb-6 md:mb-8"
          variants={fadeInUp}
        >
          The Operating System <br />
          <span className="text-default-400">For Your Wardrobe</span>
        </motion.h1>

        <motion.p
          className="text-[clamp(0.875rem,1.2vw,1.125rem)] text-default-500 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-light px-4"
          variants={fadeInUp}
        >
          Know exactly what you own, when you wore it, and how much you&apos;ve
          spent.
          <br className="hidden sm:block" />
          Finally, a digital closet that helps you make smarter style decisions.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
          variants={fadeInUp}
        >
          <DSButton
            as="a"
            href="/signup"
            icon={<ArrowRight size={18} />}
            size="lg"
            variant="primary"
          >
            Start Curating
          </DSButton>

          <DSButton
            as="a"
            href="https://chromewebstore.google.com/detail/hcakhbfdhndjcihacgbfiflkmlffknbp?utm_source=item-share-cb"
            icon={<Download size={18} />}
            iconPosition="left"
            rel="noreferrer"
            size="lg"
            target="_blank"
            variant="outline"
          >
            Get Extension
          </DSButton>
        </motion.div>

        <motion.p
          className="text-[clamp(0.625rem,0.8vw,0.75rem)] text-default-400 uppercase tracking-widest mt-8"
          variants={fadeInUp}
        >
          Free &bull; No Credit Card &bull; 50+ Fashion Sites
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ========================================
   SECTION 2: SOCIAL PROOF / STATS BAR
   ======================================== */
function StatsBar() {
  const stat1 = useCountUp(2000);
  const stat2 = useCountUp(500);
  const stat3 = useCountUp(50);

  return (
    <section className="py-8 md:py-12 border-y border-default-200 bg-default-50">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <span
              ref={stat1.ref}
              className="text-2xl md:text-3xl font-black tracking-tighter"
            >
              {stat1.count.toLocaleString()}+
            </span>
            <p className="text-[10px] uppercase tracking-widest text-default-400 mt-1">
              Items Cataloged
            </p>
          </div>
          <div className="hidden md:block h-8 w-px bg-default-200" />
          <div className="text-center">
            <span
              ref={stat2.ref}
              className="text-2xl md:text-3xl font-black tracking-tighter"
            >
              {stat2.count.toLocaleString()}+
            </span>
            <p className="text-[10px] uppercase tracking-widest text-default-400 mt-1">
              Wardrobes Created
            </p>
          </div>
          <div className="hidden md:block h-8 w-px bg-default-200" />
          <div className="text-center">
            <span
              ref={stat3.ref}
              className="text-2xl md:text-3xl font-black tracking-tighter"
            >
              {stat3.count}+
            </span>
            <p className="text-[10px] uppercase tracking-widest text-default-400 mt-1">
              Supported Sites
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ========================================
   SECTION 3: FEATURE BENTO GRID
   ======================================== */
function FeatureBentoGrid() {
  return (
    <section className="py-[var(--spacing-section)] px-4 md:px-6">
      <Container size="xl">
        <motion.h2
          className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-tighter italic mb-8 md:mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Core Features
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          initial="hidden"
          variants={staggerContainer}
          viewport={{ once: true }}
          whileInView="visible"
        >
          {/* 1. WEAR TRACKING */}
          <motion.div
            className="md:col-span-2 bg-default-50 border border-default-200 p-6 md:p-10 relative overflow-hidden group min-h-[300px] md:min-h-[380px] transition-colors duration-300 hover:border-default-400"
            variants={fadeInUp}
          >
            <div className="absolute top-4 md:top-6 right-4 md:right-6 p-2 md:p-3 bg-background border border-default-200">
              <Calendar className="md:w-6 md:h-6" size={20} />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="space-y-3 md:space-y-4 max-w-md">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
                  Track What You Actually Wear
                </h3>
                <p className="text-sm md:text-base text-default-500 font-medium">
                  Log every time you wear an item. Discover which pieces you
                  love and which are just taking up space. Make data-driven
                  decisions about your wardrobe.
                </p>
              </div>

              {/* Mini calendar mockup */}
              <div className="mt-6 md:mt-8">
                <div className="grid grid-cols-7 gap-1 max-w-[220px]">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 border border-default-200 flex items-center justify-center text-[9px] ${
                        [2, 5, 8, 11].includes(i)
                          ? "bg-foreground text-background font-bold"
                          : "bg-background"
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-default-400 mt-2">
                  4 wears this month
                </p>
              </div>
            </div>
          </motion.div>

          {/* 2. VALUATION */}
          <motion.div
            className="bg-foreground text-background p-6 md:p-10 relative flex flex-col justify-between group overflow-hidden min-h-[300px] md:min-h-[380px]"
            variants={fadeInUp}
          >
            <div className="absolute top-4 md:top-6 right-4 md:right-6 opacity-50">
              <TrendingUp className="md:w-6 md:h-6" size={20} />
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-1">
                Total Valuation
              </h3>
              <p className="opacity-40 text-xs">
                Know your closet&apos;s worth
              </p>
            </div>

            <div className="space-y-4 md:space-y-6 relative z-10">
              <div className="border-b border-current/20 pb-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] uppercase tracking-widest opacity-40">
                    Your Closet Value
                  </span>
                </div>
                <ValuationCounter />
              </div>

              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex justify-between items-center opacity-60">
                  <span className="uppercase">Total Items</span>
                  <span className="font-mono">39</span>
                </div>
                <div className="flex justify-between items-center opacity-60">
                  <span className="uppercase">Avg. Item Cost</span>
                  <span className="font-mono">$320</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. COLOR DNA */}
          <motion.div
            className="bg-background border border-default-200 p-6 md:p-10 flex flex-col justify-between group hover:border-foreground transition-colors duration-300 min-h-[300px] md:min-h-[380px]"
            variants={fadeInUp}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-1">
                  Color DNA
                </h3>
                <p className="text-default-500 text-xs">
                  Your palette at a glance
                </p>
              </div>
              <Palette className="text-default-500 md:w-5 md:h-5" size={18} />
            </div>

            <div className="space-y-2 md:space-y-3">
              {[
                {
                  color: "bg-neutral-900",
                  pct: "40%",
                  width: "w-full",
                  label: "Black",
                },
                {
                  color: "bg-neutral-400",
                  pct: "25%",
                  width: "w-[60%]",
                  label: "Gray",
                },
                {
                  color: "bg-orange-700",
                  pct: "10%",
                  width: "w-[30%]",
                  label: "Brown",
                },
              ].map((bar) => (
                <motion.div
                  key={bar.label}
                  className="flex items-center gap-2 md:gap-3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, scaleX: 1 }}
                >
                  <div
                    className={`${bar.width} h-7 md:h-8 ${bar.color} border border-default-200 flex items-center justify-center text-[10px] text-white font-bold`}
                  >
                    {bar.pct}
                  </div>
                  <span className="text-xs uppercase tracking-widest w-12 md:w-14 text-right">
                    {bar.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 4. ORGANIZATION */}
          <motion.div
            className="md:col-span-2 bg-default-50 border border-default-200 p-6 md:p-10 flex flex-col justify-center items-center text-center hover:bg-default-100 transition-colors duration-300 min-h-[300px] md:min-h-[380px]"
            variants={fadeInUp}
          >
            <Tags
              className="mb-4 md:mb-6 text-default-500 md:w-8 md:h-8"
              size={28}
            />
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-black italic text-foreground/10 select-none uppercase leading-none mb-2">
              Smart Organization
            </h3>
            <p className="text-xs md:text-sm text-default-500 mb-4 md:mb-6 max-w-md">
              Create custom wardrobes, tag by season, occasion, or brand. Find
              what you need instantly.
            </p>
            <motion.div
              className="flex flex-wrap gap-2 md:gap-4 justify-center"
              initial="hidden"
              variants={staggerContainer}
              viewport={{ once: true }}
              whileInView="visible"
            >
              {["Season", "Occasion", "Brand", "Custom"].map((tag) => (
                <motion.span
                  key={tag}
                  className="px-2 md:px-3 py-1 border border-default-300 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors duration-200 cursor-default"
                  variants={fadeInUp}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

function ValuationCounter() {
  const counter = useCountUp(12450);

  return (
    <span
      ref={counter.ref}
      className="text-3xl md:text-4xl font-mono font-light tracking-tighter"
    >
      ${counter.count.toLocaleString()}
    </span>
  );
}

/* ========================================
   SECTION 4: HOW IT WORKS
   ======================================== */
function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Import",
      description:
        "Add items from 50+ fashion sites with our Chrome extension, or manually add pieces from your closet.",
      icon: <Import className="w-8 h-8" />,
    },
    {
      number: "02",
      title: "Organize",
      description:
        "Tag by category, season, occasion, and brand. Create custom wardrobes and collections.",
      icon: <FolderOpen className="w-8 h-8" />,
    },
    {
      number: "03",
      title: "Style",
      description:
        "Plan outfits, track what you wear, and get insights on your fashion habits and spending.",
      icon: <Sparkles className="w-8 h-8" />,
    },
  ];

  return (
    <section className="py-[var(--spacing-section)] px-4 md:px-6 bg-default-50">
      <Container size="xl">
        <motion.h2
          className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-tighter italic mb-12 md:mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          How It Works
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-default-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="text-center relative"
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 border border-default-200 bg-background mb-6 relative z-10">
                {step.icon}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-default-400 mb-2">
                Step {step.number}
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-default-500 max-w-xs mx-auto leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ========================================
   SECTION 5: CHROME EXTENSION
   ======================================== */
function ChromeExtensionSection() {
  return (
    <section className="py-[var(--spacing-section)] px-4 md:px-6">
      <Container size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text side */}
          <motion.div
            className="space-y-6 md:space-y-8"
            initial={{ opacity: 0, x: -30 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="inline-block p-3 md:p-4 border border-default-200 bg-default-50">
              <ChromeIcon className="md:w-10 md:h-10" size={32} />
            </div>

            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-tighter italic">
              Add Items <span className="text-default-400">In One Click</span>
            </h2>

            <p className="text-sm md:text-base text-default-500 leading-relaxed max-w-lg">
              Our Chrome Extension lets you save items from your favorite
              shopping sites directly to your digital closet. No manual entry,
              no switching tabs — just seamless cataloging.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start">
              <DSButton
                as="a"
                href="https://chromewebstore.google.com/detail/hcakhbfdhndjcihacgbfiflkmlffknbp?utm_source=item-share-cb"
                icon={<Download size={18} />}
                iconPosition="left"
                rel="noreferrer"
                size="md"
                target="_blank"
                variant="primary"
              >
                Add to Chrome
              </DSButton>
            </div>

            {/* Supported sites */}
            <div className="flex flex-wrap gap-4 items-center pt-2">
              {["SSENSE", "Grailed", "Zara", "H&M", "ASOS"].map((site) => (
                <span
                  key={site}
                  className="text-[10px] uppercase tracking-widest text-default-400 font-medium"
                >
                  {site}
                </span>
              ))}
              <span className="text-[10px] uppercase tracking-widest text-default-300">
                + 45 more
              </span>
            </div>
          </motion.div>

          {/* Browser mockup placeholder */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="border border-default-200 bg-default-50 aspect-[4/3] flex flex-col">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-default-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-default-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-default-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-default-300" />
                </div>
                <div className="flex-1 h-5 bg-default-100 mx-8" />
              </div>
              {/* Content area */}
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <Chrome className="w-12 h-12 mx-auto text-default-300" />
                  <p className="text-xs uppercase tracking-widest text-default-400">
                    One-click import
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/* ========================================
   SECTION 6: TESTIMONIAL / QUOTE
   ======================================== */
function TestimonialSection() {
  return (
    <section className="py-[var(--spacing-section)] px-4 md:px-6 border-y border-default-200">
      <Container size="md">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, scale: 0.98 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <blockquote className="font-display text-2xl md:text-4xl lg:text-5xl italic font-light leading-snug text-foreground/80">
            &ldquo;It&apos;s like having a personal stylist that actually knows
            what&apos;s in your closet.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-default-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-default-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Early Adopter</p>
              <p className="text-xs text-default-400">Fashion Enthusiast</p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

/* ========================================
   SECTION 7: FINAL CTA
   ======================================== */
function FinalCTA() {
  return (
    <section className="py-[var(--spacing-section)] px-4 md:px-6 bg-foreground text-background">
      <Container size="lg">
        <motion.div
          className="text-center space-y-6 md:space-y-8"
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase tracking-tighter italic">
            Start Building Your Digital Closet
          </h2>
          <p className="text-sm md:text-base opacity-60 max-w-xl mx-auto">
            Join fashion enthusiasts, budget-conscious shoppers, and mindful
            minimalists who know exactly what they own.
          </p>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <DSButton
              as="a"
              className="bg-background text-foreground hover:opacity-90"
              href="/signup"
              size="lg"
              variant="primary"
            >
              Start Curating
            </DSButton>
            <p className="text-xs opacity-40 uppercase tracking-widest mt-2 md:mt-4">
              Free &bull; No Credit Card Required
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

/* ========================================
   MAIN LANDING PAGE
   ======================================== */
export default function LandingPage() {
  return (
    <div className="flex flex-col bg-background text-foreground">
      <HeroSection />
      <StatsBar />
      <FeatureBentoGrid />
      <HowItWorks />
      <ChromeExtensionSection />
      <TestimonialSection />
      <FinalCTA />
    </div>
  );
}
