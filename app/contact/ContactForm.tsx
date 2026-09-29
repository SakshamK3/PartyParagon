"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-2 text-green-700">Inquiry Sent!</h2>
        <p className="text-gray-600 mb-6">We&apos;ll get back to you within 24 hours.</p>
        <button onClick={() => setStatus("idle")} className="btn-primary">Send Another</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold mb-6">Send an Inquiry</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
          <input type="text" id="name" name="name" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="Your business name" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" id="email" name="email" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="your@business.com" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp</label>
          <input type="tel" id="phone" name="phone" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" placeholder="+91 XXXXX XXXXX" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
          <textarea id="message" name="message" required rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none" placeholder="Tell us what products you need, quantities, any customization requirements..." />
        </div>
        <button type="submit" disabled={status === "sending"} className="btn-primary w-full justify-center disabled:opacity-50">
          {status === "sending" ? "Sending..." : "Send Inquiry"}
        </button>
        {status === "error" && <p className="text-red-500 text-sm text-center">Something went wrong. Please try again or WhatsApp us.</p>}
      </form>
    </div>
  );
}
