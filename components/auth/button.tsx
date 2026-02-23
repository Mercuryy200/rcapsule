"use client";
import { Button, Link } from "@heroui/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";

import { logout } from "@/lib/actions/auth";

export const SignInButtonGoogle = () => {
  return (
    <Button
      className="w-full font-medium"
      startContent={<FaGoogle />}
      variant="bordered"
      onPress={() => signIn("google", { callbackUrl: "/closet" })}
    >
      Google
    </Button>
  );
};

export const SignInButtonGithub = () => {
  return (
    <Button
      className="w-full font-medium"
      startContent={<FaGithub />}
      variant="bordered"
      onPress={() => signIn("github", { callbackUrl: "/closet" })}
    >
      GitHub
    </Button>
  );
};
export const SignOutButton = () => {
  return (
    <Link className="text-red-600" onPress={() => logout()}>
      Sign out
    </Link>
  );
};
