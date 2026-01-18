"use client";
import React, { Suspense, useState } from "react";
import { Form, Input, Button, Link, Divider } from "@heroui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

import {
  SignInButtonGithub,
  SignInButtonGoogle,
} from "@/components/login/button";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signupSuccess = searchParams?.get("signup") === "success";

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.code === "EmailNotVerified") {
          setError(
            "Please check your email to verify your account before logging in.",
          );
        } else {
          setError("Invalid email or password.");
        }
      } else {
        router.push("/closet");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tighter uppercase italic">
          Welcome Back
        </h2>
        <p className="text-default-500 text-sm tracking-wide">
          Enter your details to access your closet
        </p>
      </div>

      {signupSuccess && (
        <div className="p-3 text-xs bg-success-50 border border-success-200 text-success-700 rounded-xl text-center">
          Closet account created! Please sign in.
        </div>
      )}

      <Form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        validationBehavior="native"
      >
        <Input
          isRequired
          label="Email"
          name="email"
          placeholder="AnnaVogue@email.com"
          type="email"
          variant="bordered"
          labelPlacement="outside"
          startContent={<Mail size={18} className="text-default-400" />}
          classNames={{ inputWrapper: "h-12" }}
        />
        <Input
          isRequired
          label="Password"
          name="password"
          placeholder="••••••••"
          variant="bordered"
          labelPlacement="outside"
          classNames={{ inputWrapper: "h-12" }}
          startContent={<Lock size={18} className="text-default-400" />}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeOff className="text-default-400" size={18} />
              ) : (
                <Eye className="text-default-400" size={18} />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
        />

        {error && (
          <p className="text-danger text-xs text-center font-medium">{error}</p>
        )}

        <Button
          className="w-full h-12 font-bold text-md mt-2 shadow-lg shadow-primary/20"
          color="primary"
          isLoading={isLoading}
          type="submit"
        >
          Sign In to Capsule
        </Button>

        <div className="flex items-center w-full gap-4 my-2">
          <Divider className="flex-1" />
          <span className="text-xs text-default-400 uppercase tracking-widest">
            Or
          </span>
          <Divider className="flex-1" />
        </div>

        <div className="grid grid-cols-2 w-full gap-3">
          <SignInButtonGoogle />
          <SignInButtonGithub />
        </div>

        <p className="text-center w-full text-sm text-default-500 pt-4">
          Don&apos;t have an account?{" "}
          <Link
            className="text-primary font-bold hover:underline"
            href="/signp"
          >
            Sign up
          </Link>
        </p>
      </Form>
    </motion.div>
  );
}

export const LoginForm = () => (
  <Suspense
    fallback={
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    }
  >
    <LoginFormContent />
  </Suspense>
);
