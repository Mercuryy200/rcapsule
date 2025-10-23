"use client";
import { Button, Link } from "@heroui/react";
import { login, logout } from "@/app/lib/actions/auth";
import { GithubIcon } from "../icons";

export const SignInButtonGoogle = () => {
  return (
    <Button className="w-full" onPress={() => login()}>
      Sign in with Google
    </Button>
  );
};
export const SignInButtonGithub = () => {
  return (
    <Button className="w-full" onPress={() => login()}>
      Sign in with GitHub
      <GithubIcon className="ml-2" />
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
