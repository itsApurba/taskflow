import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import moment from "moment";
import { Link } from "react-router-dom";
import RewardTierBadge from "./ui/RewardTierBadge";
import { getTaskStatus, getTaskType } from "../lib/game";

// Compact, tappable task line for dashboards and sprint details. Opens the task.
const TaskRow = ({ task }) => {
  const status = getTaskStatus(task.status);
  const type = getTaskType(task.type);
  return (
    <Flex
      asChild
      align='center'
      gap={3}
      px={3}
      py={2.5}
      minH={14}
      rounded='l2'
      transition='background 0.15s ease'
      _hover={{ bg: "bg.muted" }}
      focusVisibleRing='inside'
    >
      <Link to={`/task/${task._id}`} state={{ task }}>
        <Flex
          colorPalette={status.palette}
          boxSize={9}
          rounded='l2'
          bg='colorPalette.subtle'
          color='colorPalette.fg'
          align='center'
          justify='center'
          flexShrink={0}
        >
          <Icon as={status.icon} boxSize={4} />
        </Flex>
        <Box flex='1' minW={0}>
          <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
            {task.title}
          </Text>
          <Text fontSize='xs' color='fg.muted' lineClamp={1}>
            {[status.label, type?.label, task.updated_at && moment(task.updated_at).fromNow()].filter(Boolean).join(" · ")}
          </Text>
        </Box>
        {task.reward != null && <RewardTierBadge reward={task.reward} showTier={false} size='sm' />}
        <Icon as={LuChevronRight} color='fg.subtle' flexShrink={0} />
      </Link>
    </Flex>
  );
};

export default TaskRow;
