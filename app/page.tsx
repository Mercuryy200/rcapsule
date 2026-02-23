import { redirect } from "next/navigation";

import { auth } from "@/auth";
import LandingPage from "@/components/layout/LandingPage";
export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/closet");
  }

  return <LandingPage />;
}
