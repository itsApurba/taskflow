import { useEffect } from "react";

// Chakra v3 dropped its useOutsideClick hook; this mirrors the v2 behaviour.
const useOutsideClick = ({ ref, handler }) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("pointerdown", listener);
    return () => document.removeEventListener("pointerdown", listener);
  }, [ref, handler]);
};

export default useOutsideClick;
