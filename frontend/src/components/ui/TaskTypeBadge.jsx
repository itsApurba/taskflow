import { Badge, Icon } from "@chakra-ui/react";
import { getTaskType } from "../../lib/game";

const TaskTypeBadge = ({ type, ...rest }) => {
  const meta = getTaskType(type);
  if (!meta) return null;
  return (
    <Badge colorPalette={meta.palette} variant='outline' size='md' {...rest}>
      <Icon as={meta.icon} />
      {meta.label}
    </Badge>
  );
};

export default TaskTypeBadge;
