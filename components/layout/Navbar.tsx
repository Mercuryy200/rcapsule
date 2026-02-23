"use client";
import React from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Button,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/lib/config/site";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { ProfileDropdown } from "@/components/auth/dropdown";
import { Logo } from "@/components/ui/logo";

export const AppNavbar = ({ user }: { user: any }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useReducer(
    (current) => !current,
    false,
  );

  const navLinks = user ? siteConfig.navItems : siteConfig.marketingNavItems;

  return (
    <HeroUINavbar
      className="border-b border-divider"
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
          </NextLink>
        </NavbarBrand>

        <ul className="hidden lg:flex gap-4 ml-4">
          {navLinks.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "text-sm uppercase tracking-widest font-medium",
                )}
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NavbarItem>

        {user ? (
          <NavbarItem>
            <ProfileDropdown user={user} />
          </NavbarItem>
        ) : (
          <div className="flex gap-2">
            <Button as={NextLink} href="/login" size="sm" variant="light">
              Log In
            </Button>
            <Button
              as={NextLink}
              className="hidden sm:flex"
              color="primary"
              href="/signup"
              size="sm"
              variant="flat"
            >
              Sign Up
            </Button>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu className="pt-6">
        <div className="flex flex-col gap-4">
          {navLinks.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <NextLink
                className="w-full text-2xl font-light uppercase tracking-tighter py-2"
                href={item.href}
                onClick={() => setIsMenuOpen()}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}

          {!user && (
            <>
              <NavbarMenuItem>
                <NextLink
                  className="text-2xl font-light uppercase tracking-tighter py-2"
                  href="/login"
                  onClick={() => setIsMenuOpen()}
                >
                  Log In
                </NextLink>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <NextLink
                  className="text-2xl font-light uppercase tracking-tighter py-2"
                  href="/signup"
                  onClick={() => setIsMenuOpen()}
                >
                  Sign Up
                </NextLink>
              </NavbarMenuItem>
            </>
          )}

          <div className="pt-4 border-t border-divider flex items-center justify-between">
            <span className="text-sm font-medium uppercase opacity-50">
              Appearance
            </span>
            <ThemeSwitch />
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
