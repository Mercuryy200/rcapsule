"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  variants = fadeInUp,
  delay,
}: AnimatedSectionProps) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      variants={variants}
      viewport={{ once: true, margin: "-50px" }}
      whileInView="visible"
      {...(delay ? { transition: { delay } } : {})}
    >
      {children}
    </motion.section>
  );
}
