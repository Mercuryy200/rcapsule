"use client";
import { Link, Input, Button, Divider } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";

import { Logo } from "@/components/ui/logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Download App", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Refund Policy", href: "/refund-policy" },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-divider bg-background pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Link className="text-foreground w-fit" href="/">
              <Logo />
            </Link>
            <p className="text-default-500 text-sm leading-relaxed max-w-sm">
              Digitizing your wardrobe for a smarter, more sustainable
              lifestyle. Join the future of fashion management.
            </p>

            <div className="flex gap-2 max-w-sm mt-2">
              <Input
                classNames={{
                  inputWrapper:
                    "border-b border-default-400 bg-transparent px-0 shadow-none",
                }}
                placeholder="Enter your email"
                radius="none"
                size="sm"
              />
              <Button isIconOnly radius="full" size="sm" variant="light">
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        className="text-sm hover:text-default-500 transition-colors"
                        color="foreground"
                        href={link.href}
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Divider className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs text-default-400">
              © {currentYear} rcapsule. All rights reserved.
            </p>
            <span className="hidden sm:inline text-default-300">·</span>
            <Link
              className="text-xs text-default-400 hover:text-foreground transition-colors"
              href="mailto:nafouguirima@gmail.com"
            >
              nafouguirima@gmail.com
            </Link>
          </div>

          <div className="flex gap-6">
            <Link
              isExternal
              color="foreground"
              href="https://github.com/Mercuryy200"
            >
              <FaGithub
                className="hover:text-default-500 transition-colors"
                size={20}
              />
            </Link>
            <Link isExternal color="foreground" href="https://twitter.com">
              <FaTwitter
                className="hover:text-default-500 transition-colors"
                size={20}
              />
            </Link>
            <Link
              isExternal
              color="foreground"
              href="https://instagram.com/Mercuryy.200"
            >
              <FaInstagram
                className="hover:text-default-500 transition-colors"
                size={20}
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
