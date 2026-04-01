export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      neutral: "stone",
    },
    button: {
      slots: {
        base: "rounded-none border-2 border-(--stage-ink) font-semibold uppercase tracking-[0.14em] transition-[background-color,color,border-color,transform] duration-150 ease-out hover:-translate-y-px active:translate-y-0",
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
            "bg-(--stage-theater) text-(--stage-ink) hover:bg-(--stage-theater-soft) active:bg-(--stage-theater) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--stage-theater)",
        },
        {
          color: ["warning", "success"],
          variant: "solid",
          class:
            "bg-(--stage-event) text-(--stage-ink) hover:bg-(--stage-event-soft) active:bg-(--stage-event) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--stage-event)",
        },
        {
          color: "error",
          variant: "solid",
          class:
            "bg-(--stage-performer) text-(--stage-cream) hover:bg-(--stage-performer-soft) hover:text-(--stage-ink) active:bg-(--stage-performer) active:text-(--stage-cream) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--stage-performer)",
        },
        {
          color: "neutral",
          variant: "solid",
          class:
            "bg-(--stage-ink) text-(--stage-cream) hover:bg-[color:color-mix(in_srgb,var(--stage-ink)_92%,white)] active:bg-[color:color-mix(in_srgb,var(--stage-ink)_78%,white)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--stage-ink)",
        },
        {
          color: ["primary", "info"],
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-(--stage-ink) ring-(--stage-ink) hover:bg-(--stage-theater-soft) active:bg-(--stage-theater)",
        },
        {
          color: ["warning", "success"],
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-(--stage-ink) ring-(--stage-ink) hover:bg-(--stage-event-soft) active:bg-(--stage-event)",
        },
        {
          color: "error",
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-(--stage-ink) ring-(--stage-ink) hover:bg-(--stage-performer-soft) active:bg-(--stage-performer) active:text-(--stage-cream)",
        },
        {
          color: "neutral",
          variant: ["soft", "ghost", "outline", "subtle"],
          class:
            "text-(--stage-ink) ring-(--stage-ink) hover:bg-(--stage-paper) active:bg-(--stage-paper-strong)",
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
          class: "bg-(--stage-paper-strong)",
        },
        {
          color: ["primary", "info", "warning", "success", "error", "neutral"],
          variant: "ghost",
          class: "bg-[rgba(251,247,239,0.78)]",
        },
        {
          color: ["primary", "info", "warning", "success", "error", "neutral"],
          variant: "outline",
          class: "bg-transparent ring-[2px] ring-inset",
        },
        {
          color: ["primary", "info", "warning", "success", "error", "neutral"],
          variant: "subtle",
          class: "ring-[2px] ring-inset bg-(--stage-paper-strong)",
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
        root: "overflow-hidden rounded-none border-3 border-(--stage-ink) bg-[rgba(251,247,239,0.94)] shadow-[8px_8px_0_0_var(--stage-ink)]",
        header: "px-5 py-4 sm:px-6 sm:py-5",
        body: "px-5 py-5 sm:px-6 sm:py-6",
        footer: "px-5 py-4 sm:px-6 sm:py-5",
      },
    },
    input: {
      variants: {
        variant: {
          outline:
            "bg-[rgba(251,247,239,0.92)] text-(--stage-ink) ring-[2px] ring-inset ring-(--stage-ink) placeholder:text-[color:rgba(43,41,38,0.55)] focus:ring-[3px] focus:ring-(--stage-coral)",
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
            "bg-[rgba(251,247,239,0.92)] text-(--stage-ink) ring-[2px] ring-inset ring-(--stage-ink) placeholder:text-[color:rgba(43,41,38,0.55)] focus:ring-[3px] focus:ring-(--stage-coral)",
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
            "bg-[rgba(251,247,239,0.92)] text-(--stage-ink) ring-[2px] ring-inset ring-(--stage-ink) focus:ring-[3px] focus:ring-(--stage-coral)",
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
          soft: "border-2 border-(--stage-ink) font-bold uppercase tracking-[0.12em]",
          subtle: "",
        },
      },
      compoundVariants: [
        {
          color: ["primary", "info"],
          variant: "soft",
          class: "bg-[rgba(94,144,217,0.18)] text-(--stage-ink)",
        },
        {
          color: ["warning", "success"],
          variant: "soft",
          class: "bg-[rgba(231,180,55,0.22)] text-(--stage-ink)",
        },
        {
          color: "error",
          variant: "soft",
          class: "bg-[rgba(191,77,70,0.18)] text-(--stage-ink)",
        },
        {
          color: "neutral",
          variant: "soft",
          class: "bg-(--stage-paper-strong) text-(--stage-ink)",
        },
      ],
      defaultVariants: {
        variant: "soft",
      },
    },
    dropdownMenu: {
      slots: {
        content:
          "rounded-none border-3 border-(--stage-ink) bg-(--stage-cream) p-0 shadow-[8px_8px_0_0_var(--stage-ink)]",
        viewport: "p-0",
        group: "p-0",
        item:
          "rounded-none border-b border-[rgba(43,41,38,0.12)] px-3 py-3 last:border-b-0 data-[highlighted]:bg-(--stage-paper-strong) data-[highlighted]:text-(--stage-ink)",
        itemLeadingIcon: "size-4 text-(--stage-ink)",
        itemLabel: "text-sm font-medium text-(--stage-ink)",
        itemDescription: "mt-0.5 text-xs stage-muted",
        itemWrapper: "gap-0",
      },
    },
    navigationMenu: {
      slots: {
        root: "w-full",
        list: "flex flex-wrap items-center gap-2",
        item: "relative",
        link:
          "w-full rounded-none border-2 border-(--stage-ink) px-3 py-2 text-sm font-medium text-(--stage-ink) transition-colors",
        linkLeadingIcon: "size-4",
        content:
          "min-w-80 rounded-none border-3 border-(--stage-ink) bg-(--stage-cream) p-0 shadow-[8px_8px_0_0_var(--stage-ink)]",
        childList: "grid gap-0",
        childItem:
          "rounded-none border-b border-[rgba(43,41,38,0.12)] transition-colors last:border-b-0 hover:bg-(--stage-theater-soft) focus-within:bg-(--stage-theater-soft)",
        childLink:
          "flex w-full items-start gap-3 rounded-none border-0 px-3 py-3 shadow-none",
        childLinkWrapper: "min-w-0 flex-1",
        childLinkLabel: "text-sm font-medium text-(--stage-ink)",
        childLinkDescription: "mt-1 text-xs stage-muted",
      },
    },
    alert: {
      slots: {
        root: "rounded-xl border-3 border-(--stage-ink) bg-(--stage-cream) text-(--stage-ink) shadow-[6px_6px_0_0_var(--stage-ink)]",
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
