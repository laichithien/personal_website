"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactTab() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-cyan-400">Thank you!</p>
          <p className="text-sm text-white/60 mt-2">
            I&apos;ll get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
      <div className="space-y-2">
        <label className="text-sm text-white/60">Name</label>
        <Input
          required
          placeholder="Your name"
          className="bg-white/5 border-white/10"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-white/60">Email</label>
        <Input
          required
          type="email"
          placeholder="your@email.com"
          className="bg-white/5 border-white/10"
        />
      </div>
      <div className="space-y-2 flex-1">
        <label className="text-sm text-white/60">Message</label>
        <Textarea
          required
          placeholder="What's on your mind?"
          className="bg-white/5 border-white/10 min-h-[100px] resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-cyan-500 hover:bg-cyan-400"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Send className="w-4 h-4 mr-2" />
        )}
        Send Message
      </Button>
    </form>
  );
}
