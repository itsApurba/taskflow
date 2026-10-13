import { endSession } from "../api/session";

// Signs out: forgets the token and the signed-in user, and drops every cached
// query so the next person starts clean.
const useLogout = () => endSession;

export default useLogout;
