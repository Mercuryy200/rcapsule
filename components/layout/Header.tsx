"use server";
import { NavbarLoggedIn, NavbarLoggedOut } from "./Navbar";

import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  if (session?.user) {
    return <NavbarLoggedIn />;
  }

  return <NavbarLoggedOut />;
}
