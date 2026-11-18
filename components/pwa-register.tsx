"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((error: unknown) => {
        console.error("TripSplit service worker registration failed:", error);
      });
  }, []);

  return null;
}
