export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      neutral: "stone",
    },
    button: {
      slots: {
        base: "rounded-none border-2 border-[var(--stage-ink)] font-semibold uppercase tracking-[0.14em] shadow-[4px_4px_0_0_var(--stage-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0_0_var(--stage-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        label: "truncate",
      },
      variants: {
        color: {
          primary: "",
          success: "",
          info: "",
          warning: "",
          error: "",
          neutral: "",
        },
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
          solid: "",
          soft: "",
          ghost: "",
          outline: "",
          subtle: "",
          link: "shadow-none border-none underline underline-offset-4",
        },
      },
      compoundVariants: [
        {
          color: ["primary", "info"],
          variant: "solid",
          class:
            "bg-[var(--stage-theater)] text-[var(--stage-ink)] hover:bg-[color:color-mix(in_srgb,var(--stage-theater)_82%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stage-theater)]",
        },
        {
          color: ["warning", "success"],
          variant: "solid",
          class:
            "bg-[var(--stage-event)] text-[var(--stage-ink)] hover:bg-[color:color-mix(in_srgb,var(--stage-event)_82%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stage-event)]",
        },
        {
          color: "error",
          variant: "solid",
          class:
            "bg-[var(--stage-performer)] text-[var(--stage-cream)] hover:bg-[color:color-mix(in_srgb,var(--stage-performer)_88%,black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stage-performer)]",
        },
        {
          color: "neutral",
          variant: "solid",
          class:
            "bg-[var(--stage-ink)] text-[var(--stage-cream)] hover:bg-[color:color-mix(in_srgb,var(--stage-ink)_88%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--stage-ink)]",
        },
        {
          color: ["primary", "info"],
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-[var(--stage-ink)] ring-[var(--stage-ink)] hover:bg-[color:rgba(94,144,217,0.16)]",
        },
        {
          color: ["warning", "success"],
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-[var(--stage-ink)] ring-[var(--stage-ink)] hover:bg-[color:rgba(231,180,55,0.18)]",
        },
        {
          color: "error",
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-[var(--stage-ink)] ring-[var(--stage-ink)] hover:bg-[color:rgba(191,77,70,0.14)]",
        },
        {
          color: "neutral",
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-[var(--stage-ink)] ring-[var(--stage-ink)] hover:bg-[var(--stage-paper)]",
        },
        {
          color: ["primary", "info"],
          variant: "soft",
          class: "bg-[rgba(94,144,217,0.2)]",
        },
        {
          color: ["warning", "success"],
          variant: "soft",
          class: "bg-[rgba(231,180,55,0.22)]",
        },
        {
          color: "error",
          variant: "soft",
          class: "bg-[rgba(191,77,70,0.18)]",
        },
        {
          color: "neutral",
          variant: "soft",
          class: "bg-[var(--stage-paper-strong)]",
        },
        {
          color: ["primary", "info", "warning", "success", "error", "neutral"],
          variant: "ghost",
          class: "bg-[var(--stage-paper)]/80",
        },
        {
          color: ["primary", "info", "warning", "success", "error", "neutral"],
          variant: "outline",
          class: "bg-transparent ring-[2px] ring-inset",
        },
        {
          color: ["primary", "info", "warning", "success", "error", "neutral"],
          variant: "subtle",
          class: "ring-[2px] ring-inset bg-[var(--stage-paper-strong)]",
        },
      ],
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
        color: {
          primary: "",
          success: "",
          info: "",
          warning: "",
          error: "",
          neutral: "",
        },
        variant: {
          solid: "",
          outline: "",
          soft: "border-2 border-[var(--stage-ink)] font-bold uppercase tracking-[0.12em]",
          subtle: "",
        },
      },
      compoundVariants: [
        {
          color: ["primary", "info"],
          variant: "soft",
          class: "bg-[rgba(94,144,217,0.18)] text-[var(--stage-ink)]",
        },
        {
          color: ["warning", "success"],
          variant: "soft",
          class: "bg-[rgba(231,180,55,0.22)] text-[var(--stage-ink)]",
        },
        {
          color: "error",
          variant: "soft",
          class: "bg-[rgba(191,77,70,0.18)] text-[var(--stage-ink)]",
        },
        {
          color: "neutral",
          variant: "soft",
          class: "bg-[var(--stage-paper-strong)] text-[var(--stage-ink)]",
        },
      ],
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
