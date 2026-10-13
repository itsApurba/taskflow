import { Badge, Icon } from "@chakra-ui/react";
import CoinIcon from "./CoinIcon";
import { formatNumber, getRewardTier } from "../../lib/game";

// A task's credit reward, coloured by its loot tier (Common, Rare, Epic,
// Legendary). `showTier={false}` keeps only the amount; `showAmount={false}`
// only the tier name.
const RewardTierBadge = ({ reward = 0, showAmount = true, showTier = true, size = "md", ...rest }) => {
  const tier = getRewardTier(reward);
  return (
    <Badge colorPalette={tier.palette} variant='surface' size={size} aria-label={`${formatNumber(reward)} credits, ${tier.label} reward`} {...rest}>
      {showAmount ? <CoinIcon /> : <Icon as={tier.icon} />}
      {showAmount && (
        <span aria-hidden style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatNumber(reward)}
        </span>
      )}
      {showAmount && showTier && <span aria-hidden>·</span>}
      {showTier && <span aria-hidden>{tier.label}</span>}
    </Badge>
  );
};

export default RewardTierBadge;
