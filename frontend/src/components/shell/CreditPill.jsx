import { Button, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import CoinIcon from "../ui/CoinIcon";
import useMe from "../../hooks/useMe";
import { formatNumber } from "../../lib/game";

// Always-visible credit balance; tapping it opens the wallet. Before the game
// backend is live it reads "Wallet" instead of inventing a balance.
const CreditPill = () => {
  const { profile } = useMe();
  return (
    <Button
      asChild
      variant='outline'
      colorPalette='coin'
      rounded='full'
      bg='coin.subtle'
      borderColor='coin.emphasized'
      color='coin.fg'
      px={3}
      gap={1.5}
      _hover={{ bg: "coin.muted" }}
    >
      <Link to='/wallet' aria-label={profile ? `Wallet: ${formatNumber(profile.credits)} credits` : "Wallet"}>
        <CoinIcon boxSize={5} />
        {profile ? (
          <Text as='span' textStyle='hud' fontSize='md'>
            {formatNumber(profile.credits)}
          </Text>
        ) : (
          <Text as='span'>Wallet</Text>
        )}
      </Link>
    </Button>
  );
};

export default CreditPill;
