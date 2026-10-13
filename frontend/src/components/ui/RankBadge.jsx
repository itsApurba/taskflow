import { Flex } from "@chakra-ui/react";
import { RANK_MEDALS } from "../../lib/leaderboard";

const sizes = { sm: { box: 7, font: "xs" }, md: { box: 9, font: "sm" }, lg: { box: 11, font: "md" } };

// A leaderboard place. The top three get medal colours; everyone else a plain number.
const RankBadge = ({ rank, size = "md", ...rest }) => {
  const s = sizes[size] ?? sizes.md;
  const medal = RANK_MEDALS[rank];
  return (
    <Flex
      boxSize={s.box}
      flexShrink={0}
      rounded='full'
      align='center'
      justify='center'
      bg={medal ? medal.solid : "bg.muted"}
      color={medal ? medal.contrast : "fg.muted"}
      boxShadow={medal ? "inset 0 -2px 0 rgba(0, 0, 0, 0.18)" : undefined}
      textStyle='hud'
      fontSize={s.font}
      aria-label={`Rank ${rank}`}
      {...rest}
    >
      {rank}
    </Flex>
  );
};

export default RankBadge;
