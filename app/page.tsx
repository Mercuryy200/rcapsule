import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Hero from "@/components/layout/Hero";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/closet");
  }

  return (
    <>
      <Hero />
    </>
  );
}
