"use client";

import { useEffect } from "react";

// Registra o service worker do next-pwa (o register:true do plugin não injeta
// no app router deste projeto — registro manual garante o offline).
export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
