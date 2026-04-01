export type StageButtonTone = "neutral" | "theater" | "event" | "performer";

const baseRestClass = "bg-[rgba(251,247,239,0.78)]";

export const stageButtonToneClasses = (
  tone: StageButtonTone,
  active = false,
) => {
  if (tone === "theater") {
    return [
      active
        ? "bg-[var(--stage-theater)] hover:bg-[var(--stage-theater)] active:bg-[var(--stage-theater)]"
        : `${baseRestClass} hover:bg-[var(--stage-theater-soft)] active:bg-[var(--stage-theater)]`,
      "text-[var(--stage-ink)]",
    ];
  }

  if (tone === "event") {
    return [
      active
        ? "bg-[var(--stage-event)] hover:bg-[var(--stage-event)] active:bg-[var(--stage-event)]"
        : `${baseRestClass} hover:bg-[var(--stage-event-soft)] active:bg-[var(--stage-event)]`,
      "text-[var(--stage-ink)]",
    ];
  }

  if (tone === "performer") {
    return [
      active
        ? "bg-[var(--stage-performer)] text-[var(--stage-cream)] hover:bg-[var(--stage-performer)] hover:text-[var(--stage-cream)] active:bg-[var(--stage-performer)] active:text-[var(--stage-cream)]"
        : `${baseRestClass} text-[var(--stage-ink)] hover:bg-[var(--stage-performer-soft)] active:bg-[var(--stage-performer)] active:text-[var(--stage-cream)]`,
    ];
  }

  return [
    active
      ? "bg-[var(--stage-paper-strong)] text-[var(--stage-ink)]"
      : `${baseRestClass} text-[var(--stage-ink)] hover:bg-[var(--stage-paper)] active:bg-[var(--stage-paper-strong)]`,
  ];
};
