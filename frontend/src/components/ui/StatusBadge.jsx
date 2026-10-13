import { Badge, Icon } from "@chakra-ui/react";
import { getTaskStatus } from "../../lib/game";

const StatusBadge = ({ status, ...rest }) => {
  const meta = getTaskStatus(status);
  return (
    <Badge colorPalette={meta.palette} variant='subtle' size='md' {...rest}>
      <Icon as={meta.icon} />
      {meta.label}
    </Badge>
  );
};

export default StatusBadge;
