"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          animate={{ opacity: 1, scale: 1, y: 0 }}
          aria-label="Scroll to top"
          className="fixed bottom-10 right-10 z-[100] flex items-center justify-center w-14 h-14 bg-coffee text-almond rounded-full border border-gold/30 shadow-2xl hover:bg-cartier hover:scale-110 transition-all duration-300 active:scale-95 group"
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
        >
          <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

          <ArrowUp
            className="relative z-10 transition-transform duration-500 group-hover:-translate-y-1"
            size={24}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
