// src/config/shortcuts.js
export const SHORTCUTS = [
  {keys: ["Alt", "1"], label: "Alt + 1", target: "Dashboard"},
  {keys: ["Alt", "2"], label: "Alt + 2", target: "Users"},
  {keys: ["Alt", "3"], label: "Alt + 3", target: "Product"},
];

/** Cek apakah event cocok dengan shortcut yang diberikan */
export function matchShortcut(e, keys) {
  // keys contoh: ["Alt","1"]
  const mods = {
    Alt: e.altKey,
    Ctrl: e.ctrlKey,
    Shift: e.shiftKey,
    Meta: e.metaKey,
  };
  const key = keys[keys.length - 1];
  const modKeys = keys.slice(0, -1);

  const modifiersMatch = ["Alt", "Ctrl", "Shift", "Meta"].every(
    (m) => mods[m] === modKeys.includes(m),
  );

  return modifiersMatch && e.key === key;
}

/** Ambil label shortcut untuk target tertentu (misal "Product") */
export function getShortcutLabel(target) {
  return SHORTCUTS.find((s) => s.target === target)?.label || null;
}
