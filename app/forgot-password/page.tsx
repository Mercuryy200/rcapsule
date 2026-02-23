"use client";

import React, { useState } from "react";
import { Form, Input, Button, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the password reset link.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tighter uppercase italic">
            Reset Password
          </h2>
          <p className="text-default-500 text-sm tracking-wide">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {message ? (
          <div className="p-4 bg-success-50 text-success-700 rounded-xl text-center border border-success-200">
            <p>{message}</p>
            <Button
              as={Link}
              href="/login"
              variant="light"
              className="mt-2 text-success-700 font-bold"
            >
              Back to Login
            </Button>
          </div>
        ) : (
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

            {error && (
              <p className="text-danger text-xs text-center font-medium">
                {error}
              </p>
            )}

            <Button
              className="w-full h-12 font-bold text-md mt-2 shadow-lg shadow-primary/20"
              color="primary"
              isLoading={isLoading}
              type="submit"
            >
              Send Reset Link
            </Button>

            <Link
              href="/login"
              className="text-center w-full text-default-500 text-sm flex items-center justify-center gap-2 mt-4 hover:text-default-800"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </Form>
        )}
      </motion.div>
    </div>
  );
}
