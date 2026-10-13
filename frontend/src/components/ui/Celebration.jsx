import { Box, Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";
import CoinIcon from "./CoinIcon";
import CreditAmount from "./CreditAmount";

// Directions for the burst: coins spread around the big coin.
const COINS = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const distance = 92 + (i % 3) * 26;
  return {
    tx: `${Math.round(Math.cos(angle) * distance)}px`,
    ty: `${Math.round(Math.sin(angle) * distance * 0.7)}px`,
    spin: `${(i % 2 ? 1 : -1) * (90 + i * 20)}deg`,
    delay: `${(i % 4) * 0.05}s`,
    size: i % 3 === 0 ? 5 : 4,
  };
});

// A short, happy moment for payouts and redemptions: a coin burst, the amount
// and one line of context. Use it for real money moments only, not for every
// success (that is what toasts are for).
const Celebration = ({ open, onClose, eyebrow = "Payout sent", amount, title, description, actionLabel = "Nice!", children }) => (
  <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()} placement='center' size='xs' motionPreset='scale'>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner px={4}>
        <Dialog.Content overflow='hidden' textAlign='center'>
          <Box position='absolute' insetX={0} top={0} h='48' bgGradient='to-b' gradientFrom='coin.muted' gradientTo='transparent' aria-hidden />
          <Dialog.Body pt={10} pb={2} position='relative'>
            <Box position='relative' boxSize={24} mx='auto' mb={4}>
              {open &&
                COINS.map((coin, i) => (
                  <CoinIcon
                    key={i}
                    position='absolute'
                    top='50%'
                    left='50%'
                    boxSize={coin.size}
                    opacity={0}
                    style={{ "--tx": coin.tx, "--ty": coin.ty, "--spin": coin.spin, animationDelay: coin.delay }}
                    animation='coin-burst 1.2s cubic-bezier(0.2, 0.7, 0.3, 1) both'
                    aria-hidden
                  />
                ))}
              <Flex
                position='relative'
                boxSize={24}
                rounded='full'
                bg='coin.subtle'
                borderWidth='2px'
                borderColor='coin.emphasized'
                boxShadow='glow-coin'
                align='center'
                justify='center'
                animation='pop'
              >
                <CoinIcon boxSize={14} />
              </Flex>
            </Box>
            <Stack gap={1.5} align='center'>
              <Text textStyle='eyebrow' color='coin.fg'>
                {eyebrow}
              </Text>
              {amount != null && <CreditAmount value={amount} signed size='xl' color='coin.fg' />}
              <Dialog.Title fontSize='xl' fontWeight='800' overflowWrap='anywhere'>
                {title}
              </Dialog.Title>
              {description && (
                <Text color='fg.muted' fontSize='sm'>
                  {description}
                </Text>
              )}
              {children}
            </Stack>
          </Dialog.Body>
          <Dialog.Footer justifyContent='center' pb={6}>
            <Button w='full' colorPalette='coin' onClick={onClose}>
              {actionLabel}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
);

export default Celebration;
