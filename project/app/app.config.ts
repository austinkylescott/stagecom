export default defineAppConfig({
  ui: {
    colors: {
      primary: "amber",
      neutral: "stone",
    },
    button: {
      slots: {
        base: "font-semibold uppercase tracking-[0.14em] rounded-full border-2 border-[var(--stage-ink)] shadow-[4px_4px_0_0_var(--stage-ink)] data-[state=open]:translate-y-[1px] data-[state=open]:shadow-[2px_2px_0_0_var(--stage-ink)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--stage-ink)] active:translate-y-[2px] active:shadow-none",
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
        root: "rounded-[1.5rem] border-[3px] border-[var(--stage-ink)] bg-[rgba(251,247,239,0.94)] shadow-[8px_8px_0_0_var(--stage-ink)] overflow-hidden",
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
          soft: "border-2 border-[var(--stage-ink)] uppercase tracking-[0.12em] font-bold",
        },
      },
      defaultVariants: {
        variant: "soft",
      },
    },
  },
});
