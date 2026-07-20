"use client";

import { useEffect } from "react";

export default function NoCopyGuard() {
  useEffect(() => {
    function blockEvent(e: Event) {
      e.preventDefault();
    }

    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("contextmenu", blockEvent);

    const style = document.createElement("style");
    style.id = "no-copy-guard-style";
    style.innerHTML = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
      }
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("contextmenu", blockEvent);
      document.getElementById("no-copy-guard-style")?.remove();
    };
  }, []);

  return null;
}
