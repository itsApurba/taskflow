import { Badge, Icon } from "@chakra-ui/react";
import { LuFlame } from "react-icons/lu";

// Days in a row with an approved task. `compact` shows just the flame and number.
const StreakBadge = ({ days = 0, compact = false, ...rest }) => {
  const active = days > 0;
  return (
    <Badge colorPalette={active ? "orange" : "gray"} variant={active ? "subtle" : "outline"} size='lg' aria-label={`${days}-day streak`} {...rest}>
      <Icon as={LuFlame} color={active ? "orange.solid" : "fg.subtle"} />
      <span aria-hidden>{compact ? days : active ? `${days}-day streak` : "No streak yet"}</span>
    </Badge>
  );
};

export default StreakBadge;
