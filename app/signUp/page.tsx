"use client";
import React, { useState } from "react";
import { Form, Input, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { title } from "@/components/primitives";

export default function SignUpPage() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      router.push("/login?signup=success");
    } catch (error) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };
  return (
    <div>
      <h1 className={title()}>Sign Up</h1>
      <div className="flex items-center justify-center">
        <Form
          className="flex flex-col gap-4 p-5 w-1/2 "
          onSubmit={handleSubmit}
        >
          <Input
            isRequired
            errorMessage="Please enter your name"
            label="Name"
            labelPlacement="outside"
            name="name"
            placeholder="Enter your name"
            type="text"
          />

          <Input
            isRequired
            errorMessage="Please enter a valid email"
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
            type="email"
          />

          <Input
            isRequired
            errorMessage="Please enter a password"
            label="Password"
            labelPlacement="outside"
            name="password"
            placeholder="Enter your password"
            type="password"
            minLength={6}
          />

          <Input
            isRequired
            errorMessage="Please confirm your password"
            label="Confirm Password"
            labelPlacement="outside"
            name="confirmPassword"
            placeholder="Confirm your password"
            type="password"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex w-full gap-2">
            <Button
              color="primary"
              type="submit"
              className="w-1/2"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
            <Button type="reset" variant="flat" className="w-1/2">
              Reset
            </Button>
          </div>

          <div className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
