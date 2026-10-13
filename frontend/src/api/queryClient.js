import { QueryClient } from "@tanstack/react-query";

// The app's one React Query cache. It lives in its own module so code outside
// React (the API client's 401 handler) can clear it when a session ends.
const queryClient = new QueryClient();

export default queryClient;
