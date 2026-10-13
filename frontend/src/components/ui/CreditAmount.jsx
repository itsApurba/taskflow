import { HStack, Text } from "@chakra-ui/react";
import CoinIcon from "./CoinIcon";
import { formatNumber } from "../../lib/game";

const sizes = {
  sm: { fontSize: "sm", coin: "1.05em", gap: "1" },
  md: { fontSize: "md", coin: "1.1em", gap: "1.5" },
  lg: { fontSize: "2xl", coin: "0.95em", gap: "1.5" },
  xl: { fontSize: { base: "3xl", md: "4xl" }, coin: "0.9em", gap: "2" },
};

// A credit amount: coin + tabular number. `signed` adds +/- for ledger rows,
// where spending reads in red and earning in the coin colour.
const CreditAmount = ({ value, size = "md", signed = false, label, color, ...rest }) => {
  const s = sizes[size] ?? sizes.md;
  const amount = Number(value) || 0;
  const sign = signed ? (amount > 0 ? "+" : amount < 0 ? "−" : "") : "";
  const text = `${sign}${formatNumber(signed ? Math.abs(amount) : amount)}`;
  return (
    <HStack
      as='span'
      display='inline-flex'
      gap={s.gap}
      fontSize={s.fontSize}
      color={color ?? (signed && amount < 0 ? "red.fg" : "coin.fg")}
      aria-label={`${text} credits`}
      {...rest}
    >
      <CoinIcon boxSize={s.coin} />
      <Text as='span' textStyle='hud' lineHeight='1' aria-hidden>
        {text}
      </Text>
      {label && (
        <Text as='span' fontSize='0.7em' fontWeight='semibold' color='fg.muted' aria-hidden>
          {label}
        </Text>
      )}
    </HStack>
  );
};

export default CreditAmount;
