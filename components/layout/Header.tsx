import { AppNavbar } from "./Navbar";

import { auth } from "@/auth";

export default async function Header() {
  const session = await auth();

  return <AppNavbar user={session?.user} />;
}
