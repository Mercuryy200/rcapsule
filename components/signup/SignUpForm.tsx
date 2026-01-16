"use client";
import React, { useState } from "react";
import { Form, Input, Button, Link, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

import {
  SignInButtonGithub,
  SignInButtonGoogle,
} from "@/components/login/button";

export default function SignUpForm() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      router.push("/login?signup=success");
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
          Join Vesti
        </h2>
        <p className="text-default-500 text-sm tracking-wide">
          Start digitizing your wardrobe today
        </p>
      </div>

      <Form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        validationBehavior="native"
      >
        <Input
          isRequired
          label="Full Name"
          name="name"
          placeholder="Anna"
          type="text"
          variant="bordered"
          labelPlacement="outside"
          startContent={<User size={18} className="text-default-400" />}
          classNames={{ inputWrapper: "h-12" }}
        />

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
          minLength={6}
          variant="bordered"
          labelPlacement="outside"
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
          classNames={{ inputWrapper: "h-12" }}
        />

        <Input
          isRequired
          label="Confirm Password"
          name="confirmPassword"
          placeholder="••••••••"
          variant="bordered"
          labelPlacement="outside"
          startContent={<Lock size={18} className="text-default-400" />}
          type={isVisible ? "text" : "password"}
          classNames={{ inputWrapper: "h-12" }}
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
          Create Account
        </Button>

        <div className="flex items-center w-full gap-4 my-2">
          <Divider className="flex-1" />
          <span className="text-xs text-default-400 uppercase tracking-widest">
            Or
          </span>
          <Divider className="flex-1" />
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <SignInButtonGoogle />
          <SignInButtonGithub />
        </div>

        <p className="text-center w-full text-sm text-default-500 pt-4">
          Already a member?{" "}
          <Link
            className="text-primary font-bold hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </Form>
    </motion.div>
  );
}
