import { Box, Flex, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { BURST_MS } from "../../hooks/useCoinBurst";
import CoinIcon from "./CoinIcon";

const fly = keyframes`
  0% { opacity: 0; transform: translate(0, 0) scale(0.3) rotate(0deg); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--spin)); }
`;

const rise = keyframes`
  0% { opacity: 0; transform: translateY(12px) scale(0.8); }
  20% { opacity: 1; transform: translateY(0) scale(1.08); }
  70% { opacity: 1; transform: translateY(-6px) scale(1); }
  100% { opacity: 0; transform: translateY(-24px) scale(1); }
`;

// A short burst of coins in the middle of the screen with an optional label,
// for payouts and purchases. Drive it with `useCoinBurst`, which hands out the
// `burst` prop and a `fire(label)` function. Decorative only: it ignores the
// pointer and is hidden from screen readers, so pair it with a toast. Reduced
// motion skips straight to the end (invisible).
const CoinBurst = ({ burst }) => {
  if (!burst) return null;
  return (
    <Flex key={burst.id} position='fixed' inset={0} zIndex='toast' pointerEvents='none' align='center' justify='center' aria-hidden>
      <Box position='relative'>
        {burst.coins.map((coin, i) => (
          <Box
            key={i}
            position='absolute'
            top={0}
            left={0}
            ms={`-${coin.size * 2}px`}
            mt={`-${coin.size * 2}px`}
            css={{
              "--dx": coin.dx,
              "--dy": coin.dy,
              "--spin": coin.spin,
              animation: `${fly} ${BURST_MS}ms cubic-bezier(0.16, 1, 0.3, 1) ${coin.delay}ms both`,
            }}
          >
            <CoinIcon boxSize={coin.size} filter='drop-shadow(0 4px 8px rgba(0,0,0,0.25))' />
          </Box>
        ))}
        {burst.label && (
          // The wrapper centres the label; the animation owns the inner transform.
          <Box position='absolute' top={0} left={0} transform='translate(-50%, -50%)'>
            <Text
              whiteSpace='nowrap'
              textStyle='hud'
              fontSize='3xl'
              color='coin.fg'
              bg='bg.panel'
              px={4}
              py={1}
              rounded='full'
              boxShadow='glow-coin'
              css={{ animation: `${rise} ${BURST_MS}ms ease-out both` }}
            >
              {burst.label}
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default CoinBurst;
