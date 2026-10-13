import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// Chakra v2's default button was a soft gray; v3's "surface" variant is the
// closest match that stays visible on the gray.100/gray.900 panels.
const config = defineConfig({
  theme: {
    recipes: {
      button: {
        defaultVariants: {
          variant: "surface",
        },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;
