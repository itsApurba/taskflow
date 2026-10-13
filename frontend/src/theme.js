import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// TaskFlow "quest board" theme. frontend/DESIGN.md explains every token here
// and when to use it; keep the two in sync.

const fallbackFonts = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`;

// Every palette a component can take through `colorPalette` needs this set of
// semantic keys. Light mode leans on the 600/700 shades for contrast on white,
// dark mode on the 300/400 shades for contrast on ink.
const paletteTokens = (name, { solid = { _light: 600, _dark: 500 }, contrast = { _light: "white", _dark: "white" } } = {}) => ({
  solid: { value: { _light: `{colors.${name}.${solid._light}}`, _dark: `{colors.${name}.${solid._dark}}` } },
  contrast: { value: contrast },
  fg: { value: { _light: `{colors.${name}.700}`, _dark: `{colors.${name}.300}` } },
  subtle: { value: { _light: `{colors.${name}.50}`, _dark: `{colors.${name}.950}` } },
  muted: { value: { _light: `{colors.${name}.100}`, _dark: `{colors.${name}.900}` } },
  emphasized: { value: { _light: `{colors.${name}.200}`, _dark: `{colors.${name}.800}` } },
  focusRing: { value: `{colors.${name}.500}` },
  border: { value: { _light: `{colors.${name}.500}`, _dark: `{colors.${name}.400}` } },
});

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "brand",
      WebkitTapHighlightColor: "transparent",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      textRendering: "optimizeLegibility",
      // Toasts sit above the phone tab bar; AppShell raises this while the bar is on screen.
      "--toast-offset-bottom": "1rem",
    },
    body: {
      minHeight: "100dvh",
      fontFamily: "body",
    },
    // Below md the phone tab bar is on screen whenever the app shell is.
    "@media screen and (max-width: 47.99rem)": {
      "html:has([data-tab-bar])": { "--toast-offset-bottom": "calc(5.5rem + env(safe-area-inset-bottom))" },
    },
    "@media (prefers-reduced-motion: reduce)": {
      "*, *::before, *::after": {
        animationDuration: "0.01ms !important",
        animationIterationCount: "1 !important",
        transitionDuration: "0.01ms !important",
        scrollBehavior: "auto !important",
      },
    },
  },
  theme: {
    tokens: {
      colors: {
        // Neutrals with a violet ink tint; they replace Chakra's gray so every
        // default surface, border and muted text picks up the brand mood.
        gray: {
          50: { value: "#F6F5FB" },
          100: { value: "#EDECF6" },
          200: { value: "#DDDBEB" },
          300: { value: "#C3C0D8" },
          400: { value: "#9C99B6" },
          500: { value: "#75728F" },
          600: { value: "#575471" },
          700: { value: "#3E3B57" },
          800: { value: "#29273F" },
          900: { value: "#1A182E" },
          950: { value: "#100E20" },
        },
        // Primary actions, navigation, levels and the "in progress" status.
        brand: {
          50: { value: "#F3F0FF" },
          100: { value: "#E7E1FF" },
          200: { value: "#D1C6FF" },
          300: { value: "#B2A0FF" },
          400: { value: "#9273FF" },
          500: { value: "#7650FA" },
          600: { value: "#6537EE" },
          700: { value: "#5528D2" },
          800: { value: "#4623AA" },
          900: { value: "#3B2187" },
          950: { value: "#231256" },
        },
        // Credits: the coin currency, prices and the legendary reward tier.
        coin: {
          50: { value: "#FFF9E6" },
          100: { value: "#FFF0BF" },
          200: { value: "#FFE085" },
          300: { value: "#FFCD47" },
          400: { value: "#FFBB1A" },
          500: { value: "#F5A300" },
          600: { value: "#D98200" },
          700: { value: "#A85A00" },
          800: { value: "#8A4808" },
          900: { value: "#733C0C" },
          950: { value: "#3D1E02" },
        },
        // Experience points and progress bars.
        xp: {
          50: { value: "#E9FDFF" },
          100: { value: "#C8F8FE" },
          200: { value: "#97F0FD" },
          300: { value: "#57E3FA" },
          400: { value: "#1ACDF0" },
          500: { value: "#00B0D6" },
          600: { value: "#008BB3" },
          700: { value: "#076F91" },
          800: { value: "#0F5A76" },
          900: { value: "#114B63" },
          950: { value: "#052F42" },
        },
      },
      fonts: {
        heading: { value: `"Bricolage Grotesque", ${fallbackFonts}` },
        body: { value: `Figtree, ${fallbackFonts}` },
      },
      gradients: {
        // Hero surfaces: the player card, auth panel, primary "raised" nav button.
        hero: { value: "linear-gradient(135deg, #4B22D6 0%, #7650FA 48%, #1ACDF0 140%)" },
        coin: { value: "linear-gradient(145deg, #FFE38A 0%, #FFBB1A 45%, #E08A00 100%)" },
        xp: { value: "linear-gradient(90deg, #1ACDF0 0%, #9273FF 100%)" },
      },
      // `backwards` fill so hover transforms still apply once an entrance animation ends.
      animations: {
        "fade-up": { value: "fade-up 0.42s cubic-bezier(0.21, 1.02, 0.73, 1) backwards" },
        pop: { value: "pop 0.36s cubic-bezier(0.21, 1.02, 0.73, 1) backwards" },
        float: { value: "float 6s ease-in-out infinite" },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: { _light: "#F4F3FA", _dark: "#0B0A17" } },
          panel: { value: { _light: "{colors.white}", _dark: "{colors.gray.900}" } },
          muted: { value: { _light: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
          emphasized: { value: { _light: "{colors.gray.200}", _dark: "{colors.gray.700}" } },
          // Frosted bars (top bar, bottom tab bar).
          glass: { value: { _light: "rgba(255, 255, 255, 0.82)", _dark: "rgba(16, 14, 32, 0.78)" } },
        },
        fg: {
          DEFAULT: { value: { _light: "#15132B", _dark: "#F2F1FA" } },
        },
        border: {
          DEFAULT: { value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" } },
        },
        brand: paletteTokens("brand"),
        coin: paletteTokens("coin", { solid: { _light: 400, _dark: 400 }, contrast: { _light: "#2B1A00", _dark: "#2B1A00" } }),
        xp: paletteTokens("xp", { solid: { _light: 500, _dark: 400 }, contrast: { _light: "#03202B", _dark: "#03202B" } }),
      },
      radii: {
        l1: { value: "0.375rem" },
        l2: { value: "0.75rem" },
        l3: { value: "1.25rem" },
      },
      shadows: {
        card: {
          value: {
            _light: "0 1px 2px {colors.gray.900/6}, 0 6px 20px -10px {colors.gray.900/14}",
            _dark: "0 1px 0 0 {white/4} inset, 0 10px 30px -14px {black/80}",
          },
        },
        "card-hover": {
          value: {
            _light: "0 2px 4px {colors.gray.900/6}, 0 16px 32px -12px {colors.brand.700/22}",
            _dark: "0 1px 0 0 {white/6} inset, 0 18px 40px -16px {black/90}, 0 0 0 1px {colors.brand.400/24}",
          },
        },
        glow: {
          value: {
            _light: "0 10px 30px -10px {colors.brand.600/55}",
            _dark: "0 10px 34px -10px {colors.brand.400/50}",
          },
        },
        "glow-coin": {
          value: {
            _light: "0 6px 18px -8px {colors.coin.600/60}",
            _dark: "0 6px 20px -8px {colors.coin.400/45}",
          },
        },
        bar: {
          value: {
            _light: "0 -1px 0 {colors.gray.200}, 0 -10px 30px -18px {colors.gray.900/25}",
            _dark: "0 -1px 0 {colors.gray.800}, 0 -10px 30px -18px {black/90}",
          },
        },
      },
    },
    keyframes: {
      "fade-up": {
        from: { opacity: 0, transform: "translateY(8px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      pop: {
        "0%": { opacity: 0, transform: "scale(0.9)" },
        "60%": { opacity: 1, transform: "scale(1.04)" },
        "100%": { opacity: 1, transform: "scale(1)" },
      },
      float: {
        "0%, 100%": { transform: "translateY(0)" },
        "50%": { transform: "translateY(-8px)" },
      },
      shine: {
        from: { backgroundPosition: "-200% 0" },
        to: { backgroundPosition: "200% 0" },
      },
      // Payout celebration: each coin flies to (--tx, --ty) and fades.
      "coin-burst": {
        "0%": { opacity: 0, transform: "translate(-50%, -50%) scale(0.3)" },
        "12%, 70%": { opacity: 1 },
        "100%": { opacity: 0, transform: "translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(var(--spin))" },
      },
    },
    textStyles: {
      // Small all-caps label above titles and inside HUD tiles.
      eyebrow: {
        value: { fontSize: "xs", lineHeight: "1rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" },
      },
      // Numbers in the HUD: credits, XP, counts. Tabular so they do not jiggle.
      hud: {
        value: { fontFamily: "heading", fontWeight: "700", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" },
      },
    },
    layerStyles: {
      // A card-like surface for elements that cannot be a Card (links, buttons).
      panel: {
        value: { bg: "bg.panel", borderWidth: "1px", borderColor: "border", borderRadius: "l3", boxShadow: "card" },
      },
    },
    recipes: {
      // Below md the default ("md") controls grow to 44px touch targets with
      // 16px text, which also stops iOS Safari zooming in on focus.
      button: {
        base: {
          fontWeight: "semibold",
          transitionProperty: "common",
          transitionDuration: "fast",
          _active: { transform: "scale(0.97)" },
        },
        variants: {
          size: {
            md: {
              h: { base: "11", md: "10" },
              minW: { base: "11", md: "10" },
              fontSize: { base: "md", md: "sm" },
            },
            lg: { h: "12", minW: "12", px: "6" },
          },
          variant: {
            solid: {
              boxShadow: "inset 0 1px 0 0 {white/18}, 0 6px 16px -8px var(--shadow-color)",
              shadowColor: "colorPalette.solid",
            },
          },
        },
      },
      input: {
        variants: {
          size: {
            md: {
              "--input-height": { base: "sizes.11", md: "sizes.10" },
              fontSize: { base: "md", md: "sm" },
            },
          },
          variant: {
            outline: { bg: "bg.panel", borderColor: "border.emphasized" },
          },
        },
      },
      textarea: {
        variants: {
          size: {
            md: { fontSize: { base: "md", md: "sm" }, py: "2.5" },
          },
          variant: {
            outline: { bg: "bg.panel", borderColor: "border.emphasized" },
          },
        },
      },
      badge: {
        base: { fontWeight: "semibold", borderRadius: "full", gap: "1" },
      },
      heading: {
        base: { letterSpacing: "-0.02em" },
      },
    },
    slotRecipes: {
      card: {
        base: {
          root: { borderRadius: "l3" },
          title: { fontFamily: "heading", letterSpacing: "-0.01em" },
        },
        variants: {
          variant: {
            outline: { root: { bg: "bg.panel", borderColor: "border", boxShadow: "card" } },
            elevated: { root: { bg: "bg.panel", boxShadow: "card-hover" } },
          },
          size: {
            md: { root: { "--card-padding": { base: "spacing.4", md: "spacing.6" } } },
          },
        },
      },
      dialog: {
        base: {
          backdrop: { bg: "blackAlpha.600", backdropFilter: "blur(4px)" },
          // Keep a gutter around dialogs on phones instead of running edge to edge.
          positioner: { px: { base: "4", md: "0" } },
          content: { borderRadius: "l3", boxShadow: "2xl" },
          title: { fontFamily: "heading", letterSpacing: "-0.01em" },
        },
      },
      nativeSelect: {
        variants: {
          size: {
            md: {
              root: { "--select-field-height": { base: "sizes.11", md: "sizes.10" } },
              field: { fontSize: { base: "md", md: "sm" } },
            },
          },
          variant: {
            outline: { field: { bg: "bg.panel", borderColor: "border.emphasized" } },
          },
        },
      },
      menu: {
        base: {
          content: { borderRadius: "l2", p: "1.5", boxShadow: "xl" },
          item: { minH: { base: "11", md: "9" }, borderRadius: "l1", gap: "2.5" },
        },
      },
      progress: {
        base: {
          track: { borderRadius: "full" },
          range: { borderRadius: "full", transition: "width 0.8s cubic-bezier(0.21, 1.02, 0.73, 1)" },
        },
      },
      toast: {
        base: {
          root: {
            bg: "bg.panel",
            color: "fg",
            borderRadius: "l3",
            borderWidth: "1px",
            borderColor: "border",
            borderInlineStartWidth: "4px",
            borderInlineStartColor: "var(--toast-accent)",
            boxShadow: "xl",
            "--toast-accent": "colors.brand.solid",
            "&[data-type=success]": { bg: "bg.panel", color: "fg", "--toast-accent": "colors.green.solid" },
            "&[data-type=error]": { bg: "bg.panel", color: "fg", "--toast-accent": "colors.red.solid" },
            "&[data-type=warning]": { bg: "bg.panel", color: "fg", "--toast-accent": "colors.orange.solid" },
          },
          indicator: { color: "var(--toast-accent)" },
          title: { fontWeight: "semibold" },
          description: { color: "fg.muted", opacity: 1 },
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
