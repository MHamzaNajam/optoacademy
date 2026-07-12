"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const TIMEOUT_MS = 90 * 60 * 1000; // 1.5 hours
const STORAGE_KEY = "optoacademy_last_activity";

export default function InactivityLogout() {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function logoutForInactivity() {
      await supabase.auth.signOut();
      localStorage.removeItem(STORAGE_KEY);
      router.push("/login?timeout=1");
    }

    function resetTimer() {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logoutForInactivity, TIMEOUT_MS);
    }

    // On mount: check if the user was already idle past the limit
    // (covers the case of closing the tab and reopening it later)
    const lastActivity = localStorage.getItem(STORAGE_KEY);
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed >= TIMEOUT_MS) {
        logoutForInactivity();
        return;
      }
    }

    resetTimer();

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return null;
}
