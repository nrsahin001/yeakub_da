// theme.js — light / dark / device-default theme, cycled by clicking a toggle button.
// Mode stored in localStorage as "eb_theme_mode": "system" | "light" | "dark".

const ThemeManager = {
  KEY: "eb_theme_mode",
  ORDER: ["system", "light", "dark"],

  getSystemPref() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  },

  getMode() {
    return localStorage.getItem(this.KEY) || "system";
  },

  resolve(mode) {
    return mode === "system" ? this.getSystemPref() : mode;
  },

  apply(mode) {
    document.documentElement.setAttribute("data-theme", this.resolve(mode));
    this.updateButtons(mode);
  },

  setMode(mode) {
    localStorage.setItem(this.KEY, mode);
    this.apply(mode);
  },

  cycle() {
    const current = this.getMode();
    const next = this.ORDER[(this.ORDER.indexOf(current) + 1) % this.ORDER.length];
    this.setMode(next);
  },

  labelFor(mode) {
    if (mode === "light") return "Light";
    if (mode === "dark") return "Dark";
    return "Auto";
  },

  iconFor(mode) {
    if (mode === "light") return "☀️";
    if (mode === "dark") return "🌙";
    return "🖥️";
  },

  updateButtons(mode) {
    document.querySelectorAll("[data-theme-icon]").forEach((el) => { el.textContent = this.iconFor(mode); });
    document.querySelectorAll("[data-theme-label]").forEach((el) => { el.textContent = this.labelFor(mode); });
  },

  init() {
    this.apply(this.getMode());
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (this.getMode() === "system") this.apply("system");
      });
    }
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.cycle();
      });
    });
  },
};

// Apply immediately (before DOM fully parsed) to avoid a flash of the wrong theme.
document.documentElement.setAttribute("data-theme", ThemeManager.resolve(ThemeManager.getMode()));

document.addEventListener("DOMContentLoaded", () => ThemeManager.init());
