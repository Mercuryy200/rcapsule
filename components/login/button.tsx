"use client";
import { Button, Link } from "@heroui/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { logout } from "@/lib/actions/auth";

export const SignInButtonGoogle = () => {
  return (
    <Button
      className="w-full"
      onPress={() => signIn("google", { callbackUrl: "/closet" })}
    >
      Sign in with Google
      <FaGoogle className="ml-2" />
    </Button>
  );
};
export const SignInButtonGithub = () => {
  return (
    <Button
      className="w-full"
      onPress={() => signIn("github", { callbackUrl: "/closet" })}
    >
      Sign in with GitHub
      <FaGithub className="ml-2" />
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
