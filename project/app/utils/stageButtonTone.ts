export type StageButtonTone = "neutral" | "theater" | "event" | "performer";

const baseRestClass = "bg-(--stage-btn-rest)";

export const stageButtonToneClasses = (
  tone: StageButtonTone,
  active = false,
) => {
  if (tone === "theater") {
    return [
      active
        ? "bg-(--stage-theater) hover:bg-(--stage-theater) active:bg-(--stage-theater)"
        : `${baseRestClass} hover:bg-(--stage-theater-soft) active:bg-(--stage-theater)`,
      "text-(--stage-ink)",
    ];
  }

  if (tone === "event") {
    return [
      active
        ? "bg-(--stage-event) hover:bg-(--stage-event) active:bg-(--stage-event)"
        : `${baseRestClass} hover:bg-(--stage-event-soft) active:bg-(--stage-event)`,
      "text-(--stage-ink)",
    ];
  }

  if (tone === "performer") {
    return [
      active
        ? "bg-(--stage-performer) text-(--stage-cream) hover:bg-(--stage-performer) hover:text-(--stage-cream) active:bg-(--stage-performer) active:text-(--stage-cream)"
        : `${baseRestClass} text-(--stage-ink) hover:bg-(--stage-performer-soft) active:bg-(--stage-performer) active:text-(--stage-cream)`,
    ];
  }

  return [
    active
      ? "bg-(--stage-paper-strong) text-(--stage-ink)"
      : `${baseRestClass} text-(--stage-ink) hover:bg-(--stage-paper) active:bg-(--stage-paper-strong)`,
  ];
};
