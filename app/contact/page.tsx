"use client";

import { useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { EnvelopeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const { error } = await supabase.from("ContactMessages").insert([data]);

      if (error) throw error;

      setSucceeded(true);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Side: Contact Info */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic mb-2">
            Get in Touch
          </h1>
          <p className="text-default-500 mb-8 text-lg">
            Have a feature request? Found a bug? Or just want to show off your
            collection?
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-content2 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-default-400">
                  Email Us
                </p>
                <a
                  href="mailto:nafouguirima@gmail.com"
                  className="font-medium hover:underline"
                >
                  nafouguirima@gmail.com
                </a>
              </div>
            </div>

            <div className="p-6 bg-content2 rounded-lg mt-8">
              <h3 className="font-bold uppercase tracking-wider text-xs mb-2">
                Note on Scraping
              </h3>
              <p className="text-sm text-default-500">
                If a specific store isn't importing correctly, please send us
                the URL. We update our scrapers weekly.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white/5 border border-default-200 p-8 rounded-xl">
          {succeeded ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in fade-in zoom-in duration-300">
              <CheckCircleIcon className="w-16 h-16 text-success" />
              <h3 className="text-2xl font-bold uppercase tracking-tight">
                Message Sent
              </h3>
              <p className="text-default-500">
                We've received your message and saved it to our database.
              </p>
              <Button
                variant="light"
                onPress={() => setSucceeded(false)}
                className="mt-4 uppercase tracking-wider font-bold text-xs"
              >
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="name"
                  label="Name"
                  variant="bordered"
                  radius="sm"
                  isRequired
                  classNames={{ inputWrapper: "border-default-300" }}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  variant="bordered"
                  radius="sm"
                  isRequired
                  classNames={{ inputWrapper: "border-default-300" }}
                />
              </div>

              <Input
                name="subject"
                label="Subject"
                variant="bordered"
                radius="sm"
                isRequired
                classNames={{ inputWrapper: "border-default-300" }}
              />

              <Textarea
                name="message"
                label="Message"
                placeholder="Tell us what's on your mind..."
                variant="bordered"
                radius="sm"
                minRows={4}
                isRequired
                classNames={{ inputWrapper: "border-default-300" }}
              />

              <Button
                type="submit"
                fullWidth
                color="primary"
                radius="sm"
                className="font-bold uppercase tracking-widest h-12 shadow-lg shadow-primary/20"
                isLoading={submitting}
              >
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
