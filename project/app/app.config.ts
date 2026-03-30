export default defineAppConfig({
  ui: {
    colors: {
      primary: "amber",
      neutral: "stone",
    },
    button: {
      slots: {
        base: "rounded-none border-2 border-[var(--stage-ink)] font-semibold uppercase tracking-[0.14em] shadow-[4px_4px_0_0_var(--stage-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--stage-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        label: "truncate",
      },
      variants: {
        size: {
          xs: {
            base: "px-3 py-1.5 text-[10px]",
          },
          sm: {
            base: "px-3.5 py-2 text-[11px]",
          },
          md: {
            base: "px-4 py-2.5 text-[11px]",
          },
          lg: {
            base: "px-5 py-3 text-xs",
          },
        },
        variant: {
          solid:
            "bg-[var(--stage-gold)] text-[var(--stage-ink)] hover:bg-[color:var(--stage-paper)]",
          soft: "bg-[var(--stage-mint)] text-[var(--stage-ink)] hover:bg-[color:var(--stage-paper)]",
          ghost:
            "bg-[var(--stage-paper)]/80 text-[var(--stage-ink)] hover:bg-[var(--stage-paper)]",
          outline:
            "bg-transparent text-[var(--stage-ink)] hover:bg-[var(--stage-paper)]/65",
          subtle:
            "bg-[var(--stage-paper-strong)] text-[var(--stage-ink)] hover:bg-[var(--stage-paper)]",
          link: "shadow-none border-none underline underline-offset-4",
        },
      },
      defaultVariants: {
        color: "primary",
        variant: "solid",
        size: "sm",
      },
    },
    card: {
      slots: {
        root: "overflow-hidden rounded-none border-3 border-[var(--stage-ink)] bg-[rgba(251,247,239,0.94)] shadow-[8px_8px_0_0_var(--stage-ink)]",
        header: "px-5 py-4 sm:px-6 sm:py-5",
        body: "px-5 py-5 sm:px-6 sm:py-6",
        footer: "px-5 py-4 sm:px-6 sm:py-5",
      },
    },
    input: {
      variants: {
        variant: {
          outline:
            "bg-[rgba(251,247,239,0.92)] text-[var(--stage-ink)] ring-[2px] ring-inset ring-[var(--stage-ink)] placeholder:text-[color:rgba(43,41,38,0.55)] focus:ring-[3px] focus:ring-[var(--stage-coral)]",
        },
      },
      defaultVariants: {
        variant: "outline",
      },
    },
    textarea: {
      variants: {
        variant: {
          outline:
            "bg-[rgba(251,247,239,0.92)] text-[var(--stage-ink)] ring-[2px] ring-inset ring-[var(--stage-ink)] placeholder:text-[color:rgba(43,41,38,0.55)] focus:ring-[3px] focus:ring-[var(--stage-coral)]",
        },
      },
      defaultVariants: {
        variant: "outline",
      },
    },
    select: {
      variants: {
        variant: {
          outline:
            "bg-[rgba(251,247,239,0.92)] text-[var(--stage-ink)] ring-[2px] ring-inset ring-[var(--stage-ink)] focus:ring-[3px] focus:ring-[var(--stage-coral)]",
        },
      },
      defaultVariants: {
        variant: "outline",
      },
    },
    badge: {
      variants: {
        variant: {
          soft: "border-2 border-[var(--stage-ink)] font-bold uppercase tracking-[0.12em]",
        },
      },
      defaultVariants: {
        variant: "soft",
      },
    },
    alert: {
      slots: {
        root: "rounded-xl border-3 border-[var(--stage-ink)] bg-[var(--stage-cream)] text-[var(--stage-ink)] shadow-[6px_6px_0_0_var(--stage-ink)]",
        title: "font-display text-xl uppercase tracking-[0.08em]",
        description: "text-sm leading-6 text-[color:rgba(43,41,38,0.72)]",
      },
    },
    pagination: {
      slots: {
        list: "flex items-center gap-2",
      },
    },
  },
});
