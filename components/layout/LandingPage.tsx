"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Download,
  Palette,
  Tags,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
} from "lucide-react";

const ChromeIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-col items-center justify-center pt-20 md:pt-32 pb-16 md:pb-24 px-4 md:px-6 text-center overflow-hidden">
        {/* Subtle Architecture Lines */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#171717 1px, transparent 1px), linear-gradient(90deg, #171717 1px, transparent 1px)",
            backgroundSize: "100px 100px",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto z-10"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter italic leading-[0.9] mb-6 md:mb-8"
          >
            The Operating System <br />
            <span className="text-gray-500">For Your Wardrobe</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeInUp}
            className="text-base md:text-lg lg:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-light px-4"
          >
            Know exactly what you own, when you wore it, and how much you've
            spent.
            <br className="hidden sm:block" />
            Finally, a digital closet that helps you make smarter style
            decisions.
          </motion.p>

          {/* Primary Actions */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4"
          >
            <a
              href="/signup"
              className="bg-black text-white font-bold uppercase tracking-widest px-8 md:px-10 h-12 md:h-14 w-full sm:w-auto text-sm md:text-base inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Start Curating
              <ArrowRight size={18} />
            </a>

            <a
              href="https://chrome.google.com/webstore/..."
              target="_blank"
              className="border-2 border-black bg-white text-black font-bold uppercase tracking-widest px-8 md:px-10 h-12 md:h-14 w-full sm:w-auto text-sm md:text-base inline-flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Download size={18} />
              Get Extension
            </a>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-xs text-gray-500 uppercase tracking-widest mt-6"
          >
            Free • No Credit Card • Works with 50+ Fashion Sites
          </motion.p>
        </motion.div>
      </section>

      {/* --- WHO IS THIS FOR --- */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic mb-8 md:mb-12"
          >
            Perfect For
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-8 bg-white border border-gray-200"
            >
              <Sparkles className="mx-auto mb-4 text-gray-500" size={28} />
              <h3 className="font-bold uppercase tracking-widest mb-2 text-sm md:text-base">
                Fashion Enthusiasts
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Track every piece, create lookbooks, and understand your style
                evolution over time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 md:p-8 bg-white border border-gray-200"
            >
              <DollarSign className="mx-auto mb-4 text-gray-500" size={28} />
              <h3 className="font-bold uppercase tracking-widest mb-2 text-sm md:text-base">
                Budget-Conscious Shoppers
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                See your total wardrobe value and make informed decisions about
                future purchases.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 md:p-8 bg-white border border-gray-200"
            >
              <Eye className="mx-auto mb-4 text-gray-500" size={28} />
              <h3 className="font-bold uppercase tracking-widest mb-2 text-sm md:text-base">
                Mindful Minimalists
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                Know exactly what you have to avoid duplicate purchases and
                reduce waste.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- BENTO GRID --- */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-8 md:mb-12 text-center"
          >
            Core Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* 1. WEAR TRACKING */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gray-100/50 border border-gray-200 p-6 md:p-10 relative overflow-hidden group min-h-[280px] md:min-h-[340px]"
            >
              <div className="absolute top-4 md:top-6 right-4 md:right-6 p-2 md:p-3 bg-white border border-gray-200 text-gray-900">
                <Calendar size={20} className="md:w-6 md:h-6" />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-3 md:space-y-4 max-w-md">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
                    Track What You Actually Wear
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-medium">
                    Log every time you wear an item. Discover which pieces you
                    love and which are just taking up space. Make data-driven
                    decisions about your wardrobe.
                  </p>
                </div>

                <div className="mt-6 md:mt-8 space-y-2">
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <div className="w-2 h-2 bg-gray-900 rounded-full" />
                    <span className="text-gray-700">
                      See your most and least worn items
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs md:text-sm">
                    <div className="w-2 h-2 bg-gray-900 rounded-full" />
                    <span className="text-gray-700">
                      Calculate cost-per-wear for any piece
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2. VALUATION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 text-white p-6 md:p-10 relative flex flex-col justify-between group overflow-hidden min-h-[280px] md:min-h-[340px]"
            >
              <div className="absolute top-4 md:top-6 right-4 md:right-6 opacity-50">
                <TrendingUp size={20} className="md:w-6 md:h-6" />
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-1">
                  Total Valuation
                </h3>
                <p className="text-gray-400 text-xs">
                  Know your closet's worth
                </p>
              </div>

              <div className="space-y-4 md:space-y-6 relative z-10">
                <div className="border-b border-white/20 pb-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">
                      Your Closet Value
                    </span>
                  </div>
                  <span className="text-3xl md:text-4xl font-mono font-light tracking-tighter">
                    $12,450
                  </span>
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 p-6 md:p-10 flex flex-col justify-between group hover:border-gray-900 transition-colors min-h-[280px] md:min-h-[340px]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest mb-1">
                    Color DNA
                  </h3>
                  <p className="text-gray-500 text-xs">
                    Your palette at a glance
                  </p>
                </div>
                <Palette size={18} className="text-gray-500 md:w-5 md:h-5" />
              </div>

              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-full h-7 md:h-8 bg-neutral-900 border border-gray-200 flex items-center justify-center text-[10px] text-white font-bold">
                    40%
                  </div>
                  <span className="text-xs uppercase tracking-widest w-12 md:w-14 text-right">
                    Black
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-[60%] h-7 md:h-8 bg-neutral-400 border border-gray-200 flex items-center justify-center text-[10px] text-white font-bold">
                    25%
                  </div>
                  <span className="text-xs uppercase tracking-widest w-12 md:w-14 text-right">
                    Gray
                  </span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-[30%] h-7 md:h-8 bg-orange-700 border border-gray-200 flex items-center justify-center text-[10px] text-white font-bold">
                    10%
                  </div>
                  <span className="text-xs uppercase tracking-widest w-12 md:w-14 text-right">
                    Brown
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 4. ORGANIZATION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-gray-50 border border-gray-200 p-6 md:p-10 flex flex-col justify-center items-center text-center hover:bg-gray-100 transition-colors min-h-[280px] md:min-h-[340px]"
            >
              <Tags
                size={28}
                className="mb-4 md:mb-6 text-gray-500 md:w-8 md:h-8"
              />
              <h3 className="text-3xl md:text-5xl lg:text-6xl font-black italic text-gray-900/10 select-none uppercase leading-none mb-2">
                Smart Organization
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 max-w-md">
                Create custom wardrobes, tag by season, occasion, or brand. Find
                what you need instantly.
              </p>
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                <span className="px-2 md:px-3 py-1 border border-gray-300 text-[10px] font-bold uppercase tracking-widest">
                  Season
                </span>
                <span className="px-2 md:px-3 py-1 border border-gray-300 text-[10px] font-bold uppercase tracking-widest">
                  Occasion
                </span>
                <span className="px-2 md:px-3 py-1 border border-gray-300 text-[10px] font-bold uppercase tracking-widest">
                  Brand
                </span>
                <span className="px-2 md:px-3 py-1 border border-gray-300 text-[10px] font-bold uppercase tracking-widest">
                  Custom
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- BROWSER EXTENSION SECTION --- */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="inline-block p-3 md:p-4 bg-white border border-gray-200">
              <ChromeIcon size={32} className="md:w-10 md:h-10" />
            </div>

            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
              Add Items <span className="text-gray-500">In One Click</span>
            </h2>

            <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our Chrome Extension lets you save items from your favorite
              shopping sites directly to your digital closet. No manual entry,
              no switching tabs—just seamless cataloging.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-4">
              <a
                href="https://chrome.google.com/webstore/..."
                target="_blank"
                className="bg-gray-900 text-white font-bold uppercase tracking-widest px-8 md:px-10 h-12 md:h-14 w-full sm:w-auto text-sm md:text-base inline-flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Download size={18} />
                Add to Chrome
              </a>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-500">
                Works on 50+ fashion sites including SSENSE, Grailed, Zara &
                more
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 md:py-32 px-4 md:px-6 text-center border-t border-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-6 md:space-y-8"
        >
          <Sparkles
            size={32}
            className="mx-auto text-gray-400 md:w-10 md:h-10"
          />
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic">
            Start Building Your Digital Closet
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Join fashion enthusiasts, budget-conscious shoppers, and mindful
            minimalists who know exactly what they own.
          </p>
          <div className="flex flex-col items-center gap-3 md:gap-4">
            <a
              href="/signup"
              className="bg-gray-900 text-white font-bold uppercase tracking-widest px-12 md:px-16 h-14 md:h-16 text-base md:text-lg w-full sm:w-auto inline-flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              Start Curating
            </a>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2 md:mt-4">
              Free • No Credit Card Required
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
