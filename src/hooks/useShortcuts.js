// src/hooks/useShortcuts.js
import {useEffect} from "react";
import {SHORTCUTS, matchShortcut} from "../config/shortcuts";

/**
 * @param {(target: string) => void} onTrigger
 * @param {() => void} [onHelp]  // dipanggil saat user tekan "?"
 */
export function useShortcuts(onTrigger, onHelp) {
  useEffect(() => {
    const handler = (e) => {
      // Jangan trigger saat user mengetik di input/textarea/contenteditable
      const tag = document.activeElement?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        document.activeElement?.isContentEditable
      ) {
        return;
      }

      // Bantuan: "?"
      if (e.key === "?" && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onHelp?.();
        return;
      }

      // Cari shortcut yang cocok
      for (const sc of SHORTCUTS) {
        if (matchShortcut(e, sc.keys)) {
          e.preventDefault();
          onTrigger(sc.target);
          return;
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onTrigger, onHelp]);
}
