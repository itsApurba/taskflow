import { Box, Flex, Text } from "@chakra-ui/react";
import { useId } from "react";

// App mark: a check that pays out a coin. The same drawing is public/favicon.svg.
export const LogoMark = ({ size = 8, ...rest }) => {
  const id = useId();
  return (
    <Box as='svg' viewBox='0 0 32 32' boxSize={size} flexShrink={0} aria-hidden {...rest}>
      <defs>
        <linearGradient id={`${id}-g`} x1='0' y1='0' x2='32' y2='32' gradientUnits='userSpaceOnUse'>
          <stop stopColor='#4B22D6' />
          <stop offset='0.55' stopColor='#7650FA' />
          <stop offset='1' stopColor='#1ACDF0' />
        </linearGradient>
      </defs>
      <rect width='32' height='32' rx='9' fill={`url(#${id}-g)`} />
      <path d='M8.5 16.5l4.6 4.6L23 11.2' stroke='#fff' strokeWidth='3.4' strokeLinecap='round' strokeLinejoin='round' fill='none' />
      <circle cx='24.6' cy='24.6' r='3.9' fill='#FFBB1A' stroke='#fff' strokeWidth='1.8' />
    </Box>
  );
};

const Logo = ({ size = 8, showWordmark = true, color, ...rest }) => (
  <Flex align='center' gap={2.5} {...rest}>
    <LogoMark size={size} />
    {showWordmark && (
      <Text as='span' fontFamily='heading' fontWeight='800' fontSize='xl' letterSpacing='-0.03em' color={color}>
        TaskFlow
      </Text>
    )}
  </Flex>
);

export default Logo;
