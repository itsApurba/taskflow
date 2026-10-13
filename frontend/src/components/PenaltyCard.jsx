import { Badge, Box, Button, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { LuShieldAlert, LuShieldCheck, LuStore } from "react-icons/lu";
import { Link } from "react-router-dom";
import CreditAmount from "./ui/CreditAmount";
import UserAvatar from "./ui/UserAvatar";
import { formatNumber } from "../lib/game";

// A penalty: the reason, who issued it (or, for managers, who got it) and the
// credits it takes to clear. Workers clear active ones with `onClear`; when
// they are short of credits the card says how many more they need.
const PenaltyCard = ({ penalty, balance = 0, onClear, showWorker = false }) => {
  const active = penalty.status === "active";
  const shortfall = Math.max(0, penalty.cost - balance);
  const palette = active ? "red" : "green";
  return (
    <Flex
      layerStyle='panel'
      overflow='hidden'
      position='relative'
      direction='column'
      minW={0}
      opacity={active ? 1 : 0.85}
      animation='fade-up'
      _before={{ content: '""', position: "absolute", insetY: 0, insetStart: 0, w: "1", bg: `${palette}.solid` }}
    >
      <Stack gap={3} p={{ base: 4, md: 5 }} ps={{ base: 5, md: 6 }}>
        <Flex justify='space-between' align='flex-start' gap={3}>
          <HStack gap={3} align='flex-start' minW={0}>
            <Flex
              colorPalette={palette}
              boxSize={10}
              rounded='full'
              bg='colorPalette.subtle'
              color='colorPalette.fg'
              align='center'
              justify='center'
              flexShrink={0}
            >
              <Icon as={active ? LuShieldAlert : LuShieldCheck} boxSize={5} />
            </Flex>
            <Box minW={0}>
              <Text fontWeight='bold' fontSize='md' lineHeight='1.35' overflowWrap='anywhere'>
                {penalty.reason}
              </Text>
              <Text fontSize='xs' color='fg.muted' mt={0.5}>
                {showWorker ? "Issued" : `Issued by ${penalty.issuedBy?.name ?? "your manager"}`} {moment(penalty.createdAt).fromNow()}
                {!active && penalty.clearedAt && ` · cleared ${moment(penalty.clearedAt).fromNow()}`}
              </Text>
            </Box>
          </HStack>
          <Badge colorPalette={palette} variant='subtle' size='md' flexShrink={0}>
            {active ? "Active" : "Cleared"}
          </Badge>
        </Flex>

        {showWorker && penalty.worker && (
          <HStack gap={2} bg='bg.subtle' rounded='l2' px={3} py={2} minW={0}>
            <UserAvatar name={penalty.worker.name} size='xs' />
            <Text fontSize='sm' fontWeight='semibold' lineClamp={1}>
              {penalty.worker.name}
            </Text>
          </HStack>
        )}

        <Flex justify='space-between' align='center' gap={3} wrap='wrap'>
          <Box>
            <Text fontSize='xs' color='fg.muted' fontWeight='semibold'>
              {active ? "Costs to clear" : "Paid"}
            </Text>
            <CreditAmount value={penalty.cost} size='md' fontWeight='bold' />
          </Box>
          {onClear &&
            active &&
            (shortfall > 0 ? (
              <Stack gap={1} align={{ base: "stretch", sm: "flex-end" }} flex={{ base: "1 1 100%", sm: "initial" }}>
                <Button asChild variant='outline' colorPalette='gray'>
                  <Link to='/market'>
                    <LuStore /> Earn {formatNumber(shortfall)} more
                  </Link>
                </Button>
                <Text fontSize='xs' color='fg.muted' textAlign={{ sm: "end" }}>
                  You need {formatNumber(penalty.cost)} credits to clear this.
                </Text>
              </Stack>
            ) : (
              <Button colorPalette='coin' onClick={() => onClear(penalty)} flex={{ base: "1 1 100%", sm: "initial" }}>
                <LuShieldCheck /> Clear penalty
              </Button>
            ))}
        </Flex>
      </Stack>
    </Flex>
  );
};

export default PenaltyCard;
