import { Badge, Box, Button, Flex, Heading, Icon, IconButton, Menu, Portal, Progress, Stack, Text } from "@chakra-ui/react";
import { LuEllipsisVertical, LuEye, LuEyeOff, LuGift, LuInfinity, LuPackageX, LuPencil, LuTrash2 } from "react-icons/lu";
import CreditAmount from "./ui/CreditAmount";
import RewardTierBadge from "./ui/RewardTierBadge";
import { formatNumber, getRewardTier } from "../lib/game";
import { isSoldOut, isUnlimited, rewardIcon } from "../lib/store";

const StockChip = ({ reward }) => {
  if (isUnlimited(reward)) {
    return (
      <Badge variant='surface' colorPalette='gray' size='sm' bg='bg.panel'>
        <LuInfinity /> Unlimited
      </Badge>
    );
  }
  if (isSoldOut(reward)) {
    return (
      <Badge variant='solid' colorPalette='gray' size='sm'>
        <LuPackageX /> Sold out
      </Badge>
    );
  }
  return (
    <Badge variant='surface' colorPalette={reward.stock <= 2 ? "orange" : "gray"} size='sm' bg='bg.panel'>
      {formatNumber(reward.stock)} left
    </Badge>
  );
};

// A store item, coloured like loot by its price tier. Workers get a Redeem
// button (or how many credits they still need); managers get a manage menu.
// `balance` is the worker's credits; pass `onRedeem` for workers and
// `onEdit` / `onToggle` / `onDelete` for managers.
const RewardCard = ({ reward, balance = 0, redeemedCount, onRedeem, onEdit, onToggle, onDelete }) => {
  const tier = getRewardTier(reward.cost);
  const RewardIcon = rewardIcon(reward.title);
  const managing = Boolean(onEdit);
  const hidden = reward.active === false;
  const soldOut = isSoldOut(reward);
  const shortfall = Math.max(0, reward.cost - balance);
  const progress = reward.cost > 0 ? Math.min(100, Math.round((balance / reward.cost) * 100)) : 100;

  return (
    <Flex
      direction='column'
      layerStyle='panel'
      overflow='hidden'
      minW={0}
      opacity={hidden || (!managing && soldOut) ? 0.72 : 1}
      transition='transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease'
      _hover={{ transform: "translateY(-2px)", boxShadow: "card-hover" }}
      animation='fade-up'
    >
      <Box colorPalette={tier.palette} position='relative' bg='colorPalette.subtle' p={4} overflow='hidden'>
        <Box position='absolute' top='-10' right='-8' boxSize='32' rounded='full' bg='colorPalette.muted' opacity={0.7} aria-hidden />
        <Flex position='relative' justify='space-between' align='flex-start' gap={2}>
          <Flex
            boxSize={14}
            rounded='l3'
            bg='bg.panel'
            color='colorPalette.fg'
            align='center'
            justify='center'
            boxShadow='card'
            flexShrink={0}
            transform='rotate(-4deg)'
          >
            <Icon as={RewardIcon} boxSize={7} />
          </Flex>
          <Flex gap={1.5} align='center' wrap='wrap' justify='flex-end'>
            <RewardTierBadge reward={reward.cost} showAmount={false} size='sm' bg='bg.panel' />
            {hidden && (
              <Badge variant='solid' colorPalette='gray' size='sm'>
                <LuEyeOff /> Hidden
              </Badge>
            )}
            <StockChip reward={reward} />
            {managing && (
              <Menu.Root positioning={{ placement: "bottom-end" }}>
                <Menu.Trigger asChild>
                  <IconButton
                    aria-label={`Manage ${reward.title}`}
                    variant='ghost'
                    colorPalette='gray'
                    size='sm'
                    rounded='full'
                    minW={{ base: 11, md: 9 }}
                    h={{ base: 11, md: 9 }}
                    me={-2}
                    my={-2}
                  >
                    <LuEllipsisVertical />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      <Menu.Item value='edit' onClick={() => onEdit(reward)}>
                        <LuPencil /> Edit reward
                      </Menu.Item>
                      <Menu.Item value='toggle' onClick={() => onToggle(reward)}>
                        {hidden ? <LuEye /> : <LuEyeOff />} {hidden ? "Show in store" : "Hide from store"}
                      </Menu.Item>
                      <Menu.Item value='delete' color='fg.error' _highlighted={{ bg: "bg.error" }} onClick={() => onDelete(reward)}>
                        <LuTrash2 /> Delete reward
                      </Menu.Item>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
          </Flex>
        </Flex>
      </Box>

      <Stack gap={1.5} px={4} pt={4} flex='1'>
        <Heading as='h3' fontSize='lg' fontWeight='700' lineHeight='1.3' overflowWrap='anywhere' lineClamp={2}>
          {reward.title}
        </Heading>
        {reward.description && (
          <Text color='fg.muted' fontSize='sm' lineClamp={3} overflowWrap='anywhere'>
            {reward.description}
          </Text>
        )}
      </Stack>

      <Stack gap={3} p={4} pt={4}>
        <Flex justify='space-between' align='center' gap={3} wrap='wrap'>
          <CreditAmount value={reward.cost} size='lg' />
          {managing ? (
            redeemedCount != null && (
              <Text fontSize='sm' color='fg.muted' fontWeight='medium'>
                {redeemedCount === 0 ? "Not redeemed yet" : `Redeemed ${formatNumber(redeemedCount)}×`}
              </Text>
            )
          ) : soldOut ? (
            <Button disabled variant='subtle' colorPalette='gray'>
              <LuPackageX /> Sold out
            </Button>
          ) : shortfall > 0 ? (
            <Button disabled variant='subtle' colorPalette='gray' aria-label={`Need ${formatNumber(shortfall)} more credits`}>
              Need {formatNumber(shortfall)} more
            </Button>
          ) : (
            <Button colorPalette='coin' onClick={() => onRedeem(reward)}>
              <LuGift /> Redeem
            </Button>
          )}
        </Flex>
        {!managing && !soldOut && shortfall > 0 && (
          <Progress.Root value={progress} size='xs' colorPalette='coin' aria-label={`You have ${progress}% of the price`}>
            <Progress.Track bg='bg.muted'>
              <Progress.Range bgGradient='coin' />
            </Progress.Track>
          </Progress.Root>
        )}
      </Stack>
    </Flex>
  );
};

export default RewardCard;
