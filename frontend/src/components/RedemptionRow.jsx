import { Badge, Box, Button, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import moment from "moment";
import { LuCheck } from "react-icons/lu";
import CreditAmount from "./ui/CreditAmount";
import UserAvatar from "./ui/UserAvatar";
import { firstName } from "../lib/game";
import { getRedemptionStatus, rewardIcon } from "../lib/store";

// One redemption. Workers see what they bought and whether it has been
// handed over; managers also see who bought it and can mark it fulfilled
// (`onFulfill`). `managerName` personalises the "waiting" line for workers.
const RedemptionRow = ({ redemption, onFulfill, fulfilling, managerName }) => {
  const status = getRedemptionStatus(redemption.status);
  const title = redemption.reward?.title ?? redemption.rewardTitle;
  const pending = redemption.status === "pending";
  const forManager = Boolean(onFulfill);
  const when = pending ? `Redeemed ${moment(redemption.createdAt).fromNow()}` : `Fulfilled ${moment(redemption.fulfilledAt ?? redemption.updatedAt).fromNow()}`;

  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      gap={3}
      p={{ base: 3, md: 4 }}
      css={{ containerType: "inline-size" }}
    >
      <Flex align='center' gap={3} flex='1' minW={0}>
        <Flex
          colorPalette={pending ? "coin" : "green"}
          boxSize={11}
          rounded='l2'
          bg='colorPalette.subtle'
          color='colorPalette.fg'
          align='center'
          justify='center'
          flexShrink={0}
        >
          <Icon as={rewardIcon(title)} boxSize={5} />
        </Flex>
        <Box flex='1' minW={0}>
          <Text fontWeight='semibold' lineClamp={2} overflowWrap='anywhere'>
            {title}
          </Text>
          {forManager && redemption.worker && (
            <HStack gap={1.5} mt={0.5} minW={0}>
              <UserAvatar name={redemption.worker.name} size='2xs' />
              <Text fontSize='sm' fontWeight='medium' lineClamp={1}>
                {redemption.worker.name}
              </Text>
            </HStack>
          )}
          <Text fontSize='xs' color='fg.muted' mt={0.5} lineClamp={1}>
            {when}
            {!forManager && pending && managerName && ` · waiting for ${firstName(managerName)}`}
          </Text>
        </Box>
      </Flex>
      <Flex align='center' justify='space-between' gap={3} flexShrink={0} ps={{ base: 14, sm: 0 }}>
        <CreditAmount value={redemption.cost} size='sm' fontWeight='bold' />
        {forManager && pending ? (
          <Button size='sm' colorPalette='green' minH={{ base: 11, md: 9 }} loading={fulfilling} onClick={() => onFulfill(redemption)}>
            <LuCheck /> Mark fulfilled
          </Button>
        ) : (
          <Badge colorPalette={status.palette} variant='subtle' size='md'>
            <status.icon /> {status.label}
          </Badge>
        )}
      </Flex>
    </Flex>
  );
};

export default RedemptionRow;
