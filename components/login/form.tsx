"use client";
import React, { Suspense, useState } from "react";
import { Form, Input, Button, Link } from "@heroui/react";
import { SignInButtonGithub } from "./button";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signupSuccess = searchParams?.get("signup") === "success";
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
        setError("Invalid email or password");
        setIsLoading(false);
      } else if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 flex flex-col items-center">
      {signupSuccess && (
        <div className="w-1/2 mb-4 p-4 bg-green-100 text-green-700 rounded">
          Account created successfully! Please sign in.
        </div>
      )}

      <Form className="w-1/2 flex flex-col gap-4" onSubmit={handleSubmit}>
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
          errorMessage="Please enter a valid password"
          label="Password"
          labelPlacement="outside"
          name="password"
          placeholder="Enter your password"
          type="password"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex w-full gap-2">
          <Button
            color="primary"
            type="submit"
            className="w-1/2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
          <Button type="reset" variant="flat" className="w-1/2">
            Reset
          </Button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <SignInButtonGithub />

        <div className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </Form>
    </div>
  );
}

export const LoginForm = () => {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
};
