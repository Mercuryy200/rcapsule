"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <motion.h1
          className="text-5xl"
          initial={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <span className="">Organize your&nbsp;</span>
          <span className="">Closet&nbsp;</span>
          <br />
          <span className="">and find an outfit for the day</span>
        </motion.h1>

        <motion.h2
          className="text-xl mt-4"
          initial={{ opacity: 0, x: -100 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, x: 0 }}
        >
          <div className="">
            Simplify your wardrobe management with our intuitive closet
            organizer. Effortlessly track, plan, and style your outfits for any
            occasion.
          </div>
        </motion.h2>
      </div>
    </section>
  );
}
