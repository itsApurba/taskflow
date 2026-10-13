import { createToaster } from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "bottom",
  pauseOnPageIdle: true,
  // --toast-offset-bottom (theme.js) lifts toasts above the phone tab bar.
  offsets: { top: "1rem", right: "1rem", bottom: "var(--toast-offset-bottom, 1rem)", left: "1rem" },
});
