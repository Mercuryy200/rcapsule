import { auth } from "@/auth";
import { AppNavbar } from "./Navbar";

export default async function Header() {
  const session = await auth();

  return <AppNavbar user={session?.user} />;
}
