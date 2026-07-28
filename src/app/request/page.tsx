"use client";
import { useState } from "react";
import { Send, Music, CheckCircle, AlertCircle } from "lucide-react";

export default function RequestPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="text-green-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold">Request Submitted!</h1>
        <p className="text-brand-muted">
          Our community and pro verifiers will work on your tab. You'll get a notification when it's ready.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-brand-gold hover:underline text-sm"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
          <Music className="text-brand-gold" size={32} />
        </div>
        <h1 className="text-4xl font-bold">Request a Tab</h1>
        <p className="text-brand-muted">
          Can't find what you're looking for? Submit a request and our community will help.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        className="bg-brand-card rounded-3xl p-8 border border-white/5 space-y-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-bold">Song Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Wonderwall"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-brand-gold transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Artist / Band *</label>
          <input
            type="text"
            required
            placeholder="e.g. Oasis"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-brand-gold transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Genre</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-brand-gold transition">
              <option>Rock</option>
              <option>Pop</option>
              <option>Blues</option>
              <option>Jazz</option>
              <option>Metal</option>
              <option>Folk</option>
              <option>Classical</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Difficulty</label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-brand-gold transition">
              <option>Any</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold">Notes (optional)</label>
          <textarea
            rows={4}
            placeholder="Any specific details about the arrangement, tuning, or version..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-brand-gold transition resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-brand-gold text-black py-4 rounded-xl font-bold hover:scale-[1.02] transition"
        >
          <Send size={18} /> Submit Request
        </button>

        <p className="text-xs text-brand-muted text-center">
          Premium members get priority processing. Average wait time: 24-48 hours.
        </p>
      </form>
    </div>
  );
}
