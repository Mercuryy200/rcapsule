"use client";
import { useState } from "react";
import { Button, Chip, Accordion, AccordionItem } from "@heroui/react";
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  CloudIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly",
  );

  const monthlyPrice = 6.99;
  const yearlyPrice = 59.0;
  const savingsPercent = Math.round(
    ((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100,
  );

  const handleSubscribe = (plan: "free" | "premium") => {
    if (plan === "free") {
      router.push("/closet");
    } else {
      console.log(`Checkout: ${plan} - ${billingCycle}`);
    }
  };

  return (
    <div className="wardrobe-page-container min-h-screen">
      {/* Header */}
      <header className="text-center mb-16 pt-8">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">
          The Membership
        </h1>
        <div className="text-xs uppercase tracking-widest text-default-500">
          Stop guessing. Start wearing.
        </div>
      </header>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-6 mb-16">
        <span
          className={`text-xs uppercase tracking-widest cursor-pointer transition-colors ${
            billingCycle === "monthly"
              ? "text-foreground font-bold"
              : "text-default-400"
          }`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </span>

        <div
          className="w-14 h-8 bg-default-100 p-1 cursor-pointer flex items-center relative border border-default-200"
          onClick={() =>
            setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
          }
        >
          <motion.div
            className="w-6 h-6 bg-foreground"
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            animate={{ x: billingCycle === "monthly" ? 0 : 24 }}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs uppercase tracking-widest cursor-pointer transition-colors ${
              billingCycle === "yearly"
                ? "text-foreground font-bold"
                : "text-default-400"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Annually
          </span>
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: "bg-default-100 text-foreground h-5 rounded-none uppercase font-bold text-[9px] tracking-widest",
            }}
          >
            Save {savingsPercent}%
          </Chip>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto relative items-start">
        {/* FREE TIER */}
        <div className="border border-default-200 p-10 relative hover:border-default-400 transition-colors bg-background">
          <div className="mb-10 text-center md:text-left">
            <span className="font-bold uppercase tracking-widest text-xs mb-2 block text-default-500">
              The Digital Closet
            </span>
            <h2 className="font-serif italic text-3xl font-light">Organized</h2>
          </div>

          <div className="mb-10 h-16 flex items-baseline justify-center md:justify-start">
            <span className="text-5xl font-light tracking-tighter">$0</span>
            <span className="text-default-400 text-xs ml-3 uppercase tracking-widest">
              / Forever
            </span>
          </div>

          <Button
            className="w-full mb-10 font-bold uppercase tracking-widest text-xs h-14 border-default-200 hover:bg-default-100"
            variant="bordered"
            radius="none"
            onPress={() => handleSubscribe("free")}
          >
            Start Curating
          </Button>

          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-default-400 mb-4 block">
              Core Features
            </span>
            <div className="space-y-4">
              <FeatureItem included text="Unlimited Item Uploads" />
              <FeatureItem included text="Manual Outfit Canvas" />
              <FeatureItem included text="Basic Wardrobe Stats" />
              <FeatureItem included text="Calendar Log" />
              <div className="h-px w-full bg-default-200 my-2" />
              <FeatureItem included={false} text="AI Outfit Generator" />
              <FeatureItem included={false} text="Magic Background Removal" />
              <FeatureItem included={false} text="Weather-Smart Suggestions" />
            </div>
          </div>
        </div>

        {/* PREMIUM TIER */}
        <div className="border border-foreground p-10 relative bg-foreground text-background md:-translate-y-4 shadow-xl">
          <div className="absolute top-0 right-0 p-6">
            <SparklesIcon className="w-5 h-5 animate-pulse" />
          </div>

          <div className="mb-10 text-center md:text-left">
            <span className="font-bold uppercase tracking-widest text-xs mb-2 block opacity-60">
              The Pocket Stylist
            </span>
            <h2 className="font-serif italic text-3xl font-light">
              Effortless
            </h2>
          </div>

          <div className="mb-10 h-16 flex items-baseline justify-center md:justify-start overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={billingCycle}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-5xl font-light tracking-tighter"
              >
                $
                {billingCycle === "yearly"
                  ? Math.round((yearlyPrice / 12) * 100) / 100
                  : monthlyPrice}
              </motion.span>
            </AnimatePresence>
            <span className="opacity-40 text-xs ml-3 uppercase tracking-widest">
              / month
            </span>
          </div>

          <Button
            className="w-full mb-10 font-bold uppercase tracking-widest text-xs h-14 bg-background text-foreground hover:opacity-90"
            variant="solid"
            radius="none"
            onPress={() => handleSubscribe("premium")}
          >
            Upgrade Membership
          </Button>

          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4 block">
              Styling Suite
            </span>
            <div className="space-y-4">
              <li className="flex items-start gap-4">
                <SparklesIcon className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-sm font-bold block mb-1">
                    AI Outfit Generator
                  </span>
                  <span className="text-xs opacity-60 font-light">
                    Daily looks curated for your weather & events.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <CameraIcon className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-sm font-bold block mb-1">
                    Magic Edit
                  </span>
                  <span className="text-xs opacity-60 font-light">
                    One-click background removal for a clean, pro look.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <CloudIcon className="w-5 h-5 shrink-0" />
                <div>
                  <span className="text-sm font-bold block mb-1">
                    Weather Intelligence
                  </span>
                  <span className="text-xs opacity-60 font-light">
                    Never be too cold or too hot again.
                  </span>
                </div>
              </li>

              <div className="h-px w-full bg-current opacity-20 my-2" />

              <li className="flex items-center gap-3 text-sm font-light">
                <CheckIcon className="w-4 h-4 shrink-0" />
                <span className="font-medium">Unlimited Collections</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-light">
                <CheckIcon className="w-4 h-4 shrink-0" />
                <span className="font-medium">Cost-Per-Wear Analytics</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-light">
                <CheckIcon className="w-4 h-4 shrink-0" />
                <span>Priority Support</span>
              </li>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto mt-24 text-center pb-20">
        <p className="font-serif italic text-2xl mb-6">
          "It's like having a stylist in your pocket."
        </p>
        <div className="h-px w-20 bg-default-300 mx-auto mb-12" />

        <Accordion
          variant="light"
          itemClasses={{
            title: "text-sm uppercase tracking-widest font-bold text-center",
            content: "text-default-500 font-light text-sm pb-8 text-center",
            trigger: "py-4",
          }}
        >
          <AccordionItem
            key="1"
            aria-label="how-it-works"
            title="How does the AI work?"
          >
            Our AI analyzes your clothing items, local weather data, and style
            preferences to generate cohesive outfits. It learns what you like
            the more you log your daily looks.
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="cancel"
            title="Can I export my data?"
          >
            Yes. You own your data. You can export your entire wardrobe catalog
            and usage logs at any time.
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

function FeatureItem({ included, text }: { included: boolean; text: string }) {
  return (
    <li
      className={`flex items-center gap-3 text-sm font-light ${
        !included ? "text-default-300 line-through decoration-default-300" : ""
      }`}
    >
      {included ? (
        <CheckIcon className="w-4 h-4 shrink-0" />
      ) : (
        <XMarkIcon className="w-4 h-4 shrink-0 text-default-300" />
      )}
      <span>{text}</span>
    </li>
  );
}
