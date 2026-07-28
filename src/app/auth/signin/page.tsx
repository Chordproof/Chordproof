"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Music, Github } from "lucide-react";

export default function SignIn() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto py-16">
      <div className="bg-brand-card rounded-3xl p-8 border border-white/5 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto">
            <Music className="text-brand-gold" size={32} />
          </div>
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="text-brand-muted text-sm">
            Sign in to ChordProof to access all features.
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={() => {
            setIsGoogleLoading(true);
            signIn("google", { callbackUrl: "/" });
          }}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-xl font-bold hover:bg-gray-100 transition disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
            </g>
          </svg>
          {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        {/* GitHub Button */}
        <button
          onClick={() => {
            setIsGithubLoading(true);
            signIn("github", { callbackUrl: "/" });
          }}
          disabled={isGithubLoading}
          className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white py-3.5 rounded-xl font-bold hover:bg-gray-700 transition border border-gray-700 disabled:opacity-50"
        >
          <Github size={20} />
          {isGithubLoading ? "Redirecting..." : "Continue with GitHub"}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-brand-card px-4 text-brand-muted">FREE FOREVER</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-muted">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
