import { Box, HStack, Progress, Text } from "@chakra-ui/react";
import { formatNumber, levelProgress, xpForLevel } from "../../lib/game";

// XP progress towards the next level. Pass the profile fields from GET /me.
// `inverted` is for use on the hero gradient.
const XpBar = ({ xp = 0, level = 1, nextLevelXp, size = "md", showLabels = true, inverted = false, ...rest }) => {
  const next = nextLevelXp ?? xpForLevel(level + 1);
  const progress = levelProgress({ xp, level, nextLevelXp: next });
  const toGo = Math.max(0, next - xp);
  return (
    <Box w='full' {...rest}>
      {showLabels && (
        <HStack justify='space-between' mb='1.5' fontSize='xs' fontWeight='semibold' color={inverted ? "whiteAlpha.800" : "fg.muted"}>
          <Text as='span' textStyle='hud' fontSize='sm' color={inverted ? "white" : "fg"}>
            {formatNumber(xp)}
            <Text as='span' color={inverted ? "whiteAlpha.700" : "fg.muted"} fontWeight='semibold'>
              {" "}
              / {formatNumber(next)} XP
            </Text>
          </Text>
          <Text as='span'>{toGo > 0 ? `${formatNumber(toGo)} XP to level ${level + 1}` : "Level up!"}</Text>
        </HStack>
      )}
      <Progress.Root value={Math.round(progress * 100)} size={size === "sm" ? "xs" : "sm"} aria-label={`Level ${level} progress`}>
        <Progress.Track bg={inverted ? "whiteAlpha.300" : "bg.muted"} h={size === "sm" ? "1.5" : "2.5"}>
          <Progress.Range bgGradient='xp' boxShadow='0 0 12px rgba(26, 205, 240, 0.45)' />
        </Progress.Track>
      </Progress.Root>
    </Box>
  );
};

export default XpBar;
