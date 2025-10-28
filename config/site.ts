export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Closet & me",
  description: "Closet & me - Your Personal Wardrobe Manager",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Closet",
      href: "/closet",
    },
    {
      label: "Profile",
      href: "/profile",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/Mercuryy200/ClosetOrganizer",
  },
};
