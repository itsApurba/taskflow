import { Icon } from "@chakra-ui/react";
import { useId } from "react";

// The credit coin. Gradient ids are per instance so a coin inside a hidden
// container never blanks out the others.
const CoinIcon = (props) => {
  const id = useId();
  return (
    <Icon boxSize='1em' flexShrink={0} aria-hidden {...props} asChild>
      <svg viewBox='0 0 24 24' fill='none'>
        <defs>
          <linearGradient id={`${id}-face`} x1='3' y1='2' x2='21' y2='22' gradientUnits='userSpaceOnUse'>
            <stop stopColor='#FFE38A' />
            <stop offset='0.48' stopColor='#FFBB1A' />
            <stop offset='1' stopColor='#E08A00' />
          </linearGradient>
        </defs>
        <circle cx='12' cy='12' r='11' fill={`url(#${id}-face)`} />
        <circle cx='12' cy='12' r='11' stroke='#B86E00' strokeOpacity='0.35' />
        <circle cx='12' cy='12' r='7.6' stroke='#B86E00' strokeOpacity='0.4' strokeWidth='1.3' />
        <path d='M12 7.4l1.25 3.35 3.35 1.25-3.35 1.25L12 16.6l-1.25-3.35L7.4 12l3.35-1.25z' fill='#9A5B00' fillOpacity='0.82' />
        <path d='M6.1 8.6a7.3 7.3 0 0 1 3.6-3.4' stroke='#fff' strokeOpacity='0.75' strokeWidth='1.4' strokeLinecap='round' />
      </svg>
    </Icon>
  );
};

export default CoinIcon;
