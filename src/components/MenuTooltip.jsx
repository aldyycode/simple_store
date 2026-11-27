import {useEffect, useState} from "react";
import {createPortal} from "react-dom";

export default function MenuTooltip({anchorRef, open, label, shortcut}) {
  const [pos, setPos] = useState({top: 0, left: 0});

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12, // 12px jarak dari menu
      });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      role="tooltip"
      style={{top: pos.top, left: pos.left}}
      className="pointer-events-none fixed z-[100] -translate-y-1/2
        whitespace-nowrap rounded-lg border border-line bg-ink px-2.5 py-1.5
        text-xs font-medium text-white shadow-lg
        animate-fade-in
        dark:border-slate-700 dark:bg-slate-800 dark:text-white"
    >
      <span>{label}</span>
      {shortcut && (
        <span className="ml-2 inline-flex items-center rounded border border-white/20 px-1 py-0.5 text-[10px] font-semibold text-white/90">
          {shortcut}
        </span>
      )}
      {/* Panah */}
      <span
        className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-ink dark:border-r-slate-800"
        aria-hidden
      />
    </div>,
    document.body,
  );
}
