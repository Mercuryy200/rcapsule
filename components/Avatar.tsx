"use server";
import Image from "next/image";

import { auth } from "@/auth";
export default async function AvatarIcon() {
  const session = await auth();

  {
    session?.user?.image && (
      <Image
        alt={session.user.name ?? "User Avatar"}
        height="48"
        src={session.user.image}
        style={{ borderRadius: "50%" }}
        width="48"
      />
    );
  }

  return <></>;
}
