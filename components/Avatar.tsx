"use server";
import { auth } from "@/auth";
import Image from "next/image";
export default async function AvatarIcon() {
  const session = await auth();
  {
    session?.user?.image && (
      <Image
        src={session.user.image}
        alt={session.user.name ?? "User Avatar"}
        width="48"
        height="48"
        style={{ borderRadius: "50%" }}
      />
    );
  }

  return <></>;
}
