import { Box, Flex, Grid, Icon, Text } from "@chakra-ui/react";
import moment from "moment";
import { LuCheck, LuCoins, LuHand, LuHourglass, LuRotateCcw, LuStore } from "react-icons/lu";
import { getTaskStatus } from "../lib/game";

// Where a market task is on its way from the market to a payout.
const STEPS = [
  { status: "open", label: "Posted", icon: LuStore, at: "created_at" },
  { status: "in progress", label: "Claimed", icon: LuHand, at: "claimedAt" },
  { status: "in review", label: "In review", icon: LuHourglass, at: "submittedAt" },
  { status: "done", label: "Paid", icon: LuCoins, at: "approvedAt" },
];

const TaskLifecycle = ({ task, ...rest }) => {
  const current = Math.max(
    0,
    STEPS.findIndex((step) => step.status === task.status),
  );
  // A rejected task is back in progress with the manager's note on it.
  const sentBack = task.status === "in progress" && Boolean(task.reviewNote);
  return (
    <Grid as='ol' templateColumns='repeat(4, minmax(0, 1fr))' listStyleType='none' aria-label='Task progress' {...rest}>
      {STEPS.map((step, i) => {
        const done = i < current || task.status === "done";
        const active = i === current && task.status !== "done";
        const palette = done ? (i === 3 ? "coin" : "green") : active ? (sentBack ? "orange" : getTaskStatus(task.status).palette) : "gray";
        const icon = done ? (i === 3 ? LuCoins : LuCheck) : active && sentBack ? LuRotateCcw : step.icon;
        const when = task[step.at];
        return (
          <Flex as='li' key={step.status} direction='column' align='center' textAlign='center' position='relative' minW={0} aria-current={active ? "step" : undefined}>
            {i > 0 && (
              <Box
                position='absolute'
                top={{ base: 4, md: 5 }}
                right='50%'
                w='100%'
                h='2px'
                transform='translateY(-50%)'
                bg={i <= current ? "green.solid" : "border"}
                aria-hidden
              />
            )}
            <Flex
              position='relative'
              colorPalette={palette}
              boxSize={{ base: 8, md: 10 }}
              rounded='full'
              align='center'
              justify='center'
              bg={done || active ? "colorPalette.solid" : "bg.panel"}
              color={done || active ? "colorPalette.contrast" : "fg.subtle"}
              borderWidth={done || active ? 0 : "2px"}
              borderColor='border.emphasized'
              boxShadow={active ? "0 0 0 4px var(--chakra-colors-color-palette-muted)" : undefined}
            >
              <Icon as={icon} boxSize={{ base: 4, md: 5 }} />
            </Flex>
            <Text mt={2} fontSize={{ base: "xs", md: "sm" }} fontWeight={active ? "bold" : "semibold"} color={done || active ? "fg" : "fg.muted"} lineClamp={1}>
              {active && sentBack ? "Fixing" : step.label}
            </Text>
            <Text fontSize='2xs' color='fg.subtle' lineClamp={1} minH='1rem'>
              {when && (done || active) ? moment(when).format("D MMM") : ""}
            </Text>
          </Flex>
        );
      })}
    </Grid>
  );
};

export default TaskLifecycle;
