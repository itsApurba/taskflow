import { Box, Icon, Text } from "@chakra-ui/react";
import { useId } from "react";
import { LuLock } from "react-icons/lu";

const sizes = { sm: 8, md: 11, lg: 16, xl: 20 };
const fontSizes = { sm: "xs", md: "md", lg: "xl", xl: "2xl" };

// A hexagon shield with the player's level. Without a level (no game backend
// yet) it shows a lock so the slot keeps its shape.
const LevelBadge = ({ level, size = "md", ...rest }) => {
  const id = useId();
  const locked = level == null;
  return (
    <Box
      position='relative'
      boxSize={sizes[size]}
      flexShrink={0}
      display='inline-grid'
      placeItems='center'
      role='img'
      aria-label={locked ? "Level locked" : `Level ${level}`}
      {...rest}
    >
      <Box as='svg' position='absolute' inset='0' boxSize='full' viewBox='0 0 40 44' aria-hidden overflow='visible'>
        <defs>
          <linearGradient id={`${id}-fill`} x1='0' y1='0' x2='40' y2='44' gradientUnits='userSpaceOnUse'>
            <stop stopColor={locked ? "#9C99B6" : "#9273FF"} />
            <stop offset='1' stopColor={locked ? "#575471" : "#4B22D6"} />
          </linearGradient>
        </defs>
        <path
          d='M20 1.5l16.5 9.5v22L20 42.5 3.5 33V11z'
          fill={`url(#${id}-fill)`}
          stroke={locked ? "#C3C0D8" : "#D1C6FF"}
          strokeOpacity='0.6'
          strokeWidth='1.5'
          strokeLinejoin='round'
        />
        <path d='M20 6l12.6 7.3' stroke='#fff' strokeOpacity='0.45' strokeWidth='1.5' strokeLinecap='round' />
      </Box>
      {locked ? (
        <Icon as={LuLock} position='relative' color='white' boxSize='40%' />
      ) : (
        <Text as='span' position='relative' color='white' fontSize={fontSizes[size]} textStyle='hud' lineHeight='1' aria-hidden>
          {level}
        </Text>
      )}
    </Box>
  );
};

export default LevelBadge;
