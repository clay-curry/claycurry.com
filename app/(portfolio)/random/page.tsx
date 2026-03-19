"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HeroContactAskAI } from "@/lib/components/chat/hero-contact-ask-ai";
import { NAV_MAP, PageNav } from "@/lib/components/site/page-nav";
import { contactData } from "@/lib/portfolio-data";

export default function ContactPage() {
  const data = contactData;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast.success("Message sent! I'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 md:py-12 px-2 md:px-4 flex flex-col gap-12 md:gap-14">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-geist font-semibold uppercase tracking-wider text-xl md:text-2xl">
            Contact
          </span>
          <div className="w-3 h-px bg-foreground rounded-full" />
        </div>
      </div>

      <div>
        <div className="w-full h-48 md:h-72 rounded-xl md:rounded-2xl overflow-hidden border border-border bg-secondary">
          <iframe
            src={data.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Office Location"
          />
        </div>
      </div>

      <div>
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
                placeholder="Alan Turing"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all text-sm md:text-base"
                placeholder="alan.turing@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Your Message
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all resize-none text-sm md:text-base"
              placeholder="Write your message here..."
              required
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto md:ml-auto justify-end">
            <HeroContactAskAI
              getPrompt={() => {
                const parts: string[] = [];
                if (formData.name) parts.push(`From: ${formData.name}`);
                if (formData.email) parts.push(`Email: ${formData.email}`);
                if (formData.message) parts.push(formData.message);
                return parts.join("\n");
              }}
            />
            <button
              type="submit"
              data-click-id="contact:submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 bg-secondary text-secondary-foreground border border-input rounded-xl font-medium hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
      <PageNav prev={NAV_MAP["/random"].prev} next={NAV_MAP["/random"].next} />
    </div>
  );
}
