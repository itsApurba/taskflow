import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Chakra v2's default button was a soft gray; v3's "surface" variant is the
// closest match that stays visible on the gray.100/gray.900 panels.
// Below the md breakpoint the default ("md") controls grow to 44px touch
// targets with 16px text, which also stops iOS Safari zooming in on focus.
const config = defineConfig({
  theme: {
    recipes: {
      button: {
        variants: {
          size: {
            md: {
              h: { base: "11", md: "10" },
              minW: { base: "11", md: "10" },
              fontSize: { base: "md", md: "sm" },
            },
          },
        },
        defaultVariants: {
          variant: "surface",
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
        },
      },
    },
    slotRecipes: {
      // Keep a gutter around dialogs on phones instead of running edge to edge.
      dialog: {
        base: {
          positioner: {
            px: { base: "4", md: "0" },
          },
        },
      },
      nativeSelect: {
        variants: {
          size: {
            md: {
              root: {
                "--select-field-height": { base: "sizes.11", md: "sizes.10" },
              },
              field: {
                fontSize: { base: "md", md: "sm" },
              },
            },
          },
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
