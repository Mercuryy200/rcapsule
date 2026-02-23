import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/layout/LandingPage";
export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/closet");
  }

  return <LandingPage />;
}
