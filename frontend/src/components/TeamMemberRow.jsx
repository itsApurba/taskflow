import { Badge, Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { LuCircleCheckBig, LuFlame, LuHourglass, LuShieldAlert, LuTimer } from "react-icons/lu";
import CreditAmount from "./ui/CreditAmount";
import LevelBadge from "./ui/LevelBadge";
import UserAvatar from "./ui/UserAvatar";
import XpBar from "./ui/XpBar";

const Count = ({ icon, value, label, palette }) => (
  <HStack gap={1} colorPalette={palette} color={value > 0 ? "colorPalette.fg" : "fg.subtle"} aria-label={`${value} ${label}`}>
    <Icon as={icon} boxSize={3.5} />
    <Text as='span' textStyle='hud' fontSize='sm' aria-hidden>
      {value}
    </Text>
  </HStack>
);

// One report on a manager's team (from GET /users/team): who they are, their
// level and XP, balance, streak and where their tasks stand.
const TeamMemberRow = ({ member }) => (
  <Flex gap={3} px={3} py={3} rounded='l2' align='flex-start'>
    <Box position='relative' flexShrink={0}>
      <UserAvatar name={member.name} size='md' />
      <LevelBadge level={member.level} size='sm' position='absolute' bottom='-1.5' right='-2' boxSize={6} />
    </Box>
    <Box flex='1' minW={0}>
      <Flex justify='space-between' align='center' gap={2}>
        <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
          {member.name}
        </Text>
        <CreditAmount value={member.credits} size='sm' flexShrink={0} />
      </Flex>
      <XpBar xp={member.xp} level={member.level} nextLevelXp={member.nextLevelXp} size='sm' showLabels={false} my={2} />
      <Flex gap={3} align='center' wrap='wrap' rowGap={1}>
        <Count icon={LuTimer} value={member.tasksInProgress} label='in progress' palette='brand' />
        <Count icon={LuHourglass} value={member.tasksInReview} label='in review' palette='orange' />
        <Count icon={LuCircleCheckBig} value={member.tasksDone} label='done' palette='green' />
        <Count icon={LuFlame} value={member.streak} label='day streak' palette='orange' />
        {member.activePenalties > 0 && (
          <Badge colorPalette='red' variant='subtle' size='sm'>
            <LuShieldAlert /> {member.activePenalties} {member.activePenalties === 1 ? "penalty" : "penalties"}
          </Badge>
        )}
      </Flex>
    </Box>
  </Flex>
);

export default TeamMemberRow;
