import { Badge, Box, Button, Flex, Grid, HStack, Icon, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { LuArrowDownLeft, LuArrowUpRight, LuChevronRight, LuGavel, LuGift, LuHourglass, LuReceipt, LuShieldAlert, LuStore, LuUsers } from "react-icons/lu";
import { Link } from "react-router-dom";
import LedgerList from "../components/LedgerList";
import PenaltyFormDialog from "../components/PenaltyFormDialog";
import { GameLocked, LoadError, SkeletonRows } from "../components/EconomyStates";
import CoinIcon from "../components/ui/CoinIcon";
import CreditAmount from "../components/ui/CreditAmount";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHeader from "../components/ui/PageHeader";
import SectionHeader from "../components/ui/SectionHeader";
import StatTile from "../components/ui/StatTile";
import UserAvatar from "../components/ui/UserAvatar";
import useMe from "../hooks/useMe";
import usePenalties from "../hooks/usePenalties";
import useRedemptions from "../hooks/useRedemptions";
import useTeam from "../hooks/useTeam";
import useWallet from "../hooks/useWallet";
import { formatNumber } from "../lib/game";

const HISTORY_FILTERS = {
  all: () => true,
  earned: (entry) => entry.amount > 0,
  spent: (entry) => entry.amount < 0,
};

// The big balance card at the top of a worker's wallet.
const BalanceCard = ({ wallet }) => (
  <Box position='relative' overflow='hidden' layerStyle='panel' borderColor='coin.muted' p={{ base: 5, md: 7 }} animation='fade-up'>
    <Box position='absolute' top='-20' right='-16' boxSize='64' rounded='full' bgGradient='coin' opacity={0.18} filter='blur(48px)' aria-hidden />
    <CoinIcon
      position='absolute'
      right={{ base: -6, md: 6 }}
      top={{ base: -4, md: 5 }}
      boxSize={{ base: 28, md: 32 }}
      opacity={0.14}
      transform='rotate(-14deg)'
    />
    <Stack position='relative' gap={5}>
      <Box>
        <Text textStyle='eyebrow' color='coin.fg'>
          Balance
        </Text>
        <CreditAmount value={wallet.balance} size='xl' color='fg' mt={2} />
      </Box>
      <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={3} maxW='md'>
        <HStack gap={2.5} bg='bg.subtle' rounded='l2' px={3} py={2.5} minW={0}>
          <Flex boxSize={8} rounded='full' bg='green.subtle' color='green.fg' align='center' justify='center' flexShrink={0}>
            <LuArrowDownLeft />
          </Flex>
          <Box minW={0}>
            <Text fontSize='xs' color='fg.muted' fontWeight='semibold'>
              Earned
            </Text>
            <Text textStyle='hud' fontSize='lg' lineHeight='1.2'>
              {formatNumber(wallet.earned)}
            </Text>
          </Box>
        </HStack>
        <HStack gap={2.5} bg='bg.subtle' rounded='l2' px={3} py={2.5} minW={0}>
          <Flex boxSize={8} rounded='full' bg='red.subtle' color='red.fg' align='center' justify='center' flexShrink={0}>
            <LuArrowUpRight />
          </Flex>
          <Box minW={0}>
            <Text fontSize='xs' color='fg.muted' fontWeight='semibold'>
              Spent
            </Text>
            <Text textStyle='hud' fontSize='lg' lineHeight='1.2'>
              {formatNumber(wallet.spent)}
            </Text>
          </Box>
        </HStack>
      </Grid>
      <Flex gap={2} direction={{ base: "column", sm: "row" }}>
        <Button asChild colorPalette='coin'>
          <Link to='/store'>
            <LuGift /> Spend in the store
          </Link>
        </Button>
        <Button asChild variant='outline' colorPalette='gray'>
          <Link to='/market'>
            <LuStore /> Earn more
          </Link>
        </Button>
      </Flex>
    </Stack>
  </Box>
);

// A tappable callout row in the wallet sidebar.
const Callout = ({ to, icon, palette, title, description }) => (
  <Flex
    asChild
    align='center'
    gap={3}
    layerStyle='panel'
    p={4}
    colorPalette={palette}
    borderColor='colorPalette.muted'
    transition='transform 0.2s ease, box-shadow 0.2s ease'
    _hover={{ transform: "translateY(-2px)", boxShadow: "card-hover" }}
    focusVisibleRing='outside'
    animation='fade-up'
  >
    <Link to={to}>
      <Flex boxSize={11} rounded='full' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center' flexShrink={0}>
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Box flex='1' minW={0}>
        <Text fontWeight='bold'>{title}</Text>
        <Text fontSize='sm' color='fg.muted'>
          {description}
        </Text>
      </Box>
      <Icon as={LuChevronRight} color='fg.subtle' flexShrink={0} />
    </Link>
  </Flex>
);

const WorkerWallet = () => {
  const wallet = useWallet();
  const penalties = usePenalties();
  const redemptions = useRedemptions();
  const [filter, setFilter] = useState("all");

  const transactions = useMemo(() => wallet.data?.transactions ?? [], [wallet.data]);
  const visible = transactions.filter(HISTORY_FILTERS[filter]);
  const activePenalties = (penalties.data ?? []).filter((p) => p.status === "active");
  const owed = activePenalties.reduce((sum, p) => sum + p.cost, 0);
  const pending = (redemptions.data ?? []).filter((r) => r.status === "pending");

  if (wallet.isError) return <LoadError what='your wallet' onRetry={wallet.refetch} />;

  return (
    <Grid
      templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 20rem", xl: "minmax(0, 1fr) 22rem" }}
      templateAreas={{ base: `"balance" "side" "activity"`, lg: `"balance side" "activity side"` }}
      templateRows={{ lg: "auto 1fr" }}
      gap={{ base: 5, md: 6 }}
      alignItems='start'
    >
      <Box gridArea='balance' minW={0}>
        {wallet.isLoading ? <Skeleton h='64' rounded='l3' /> : <BalanceCard wallet={wallet.data} />}
      </Box>
      <Box gridArea='activity' minW={0}>
        <SectionHeader title='Activity' count={wallet.isLoading ? undefined : transactions.length} />
        <FilterChips
          label='Filter activity'
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: transactions.length },
            { value: "earned", label: "Earned", count: transactions.filter(HISTORY_FILTERS.earned).length },
            { value: "spent", label: "Spent", count: transactions.filter(HISTORY_FILTERS.spent).length },
          ]}
          mb={4}
        />
        {wallet.isLoading ? (
          <SkeletonRows />
        ) : visible.length ? (
          <LedgerList entries={visible} />
        ) : (
          <Box layerStyle='panel'>
            <EmptyState
              icon={LuReceipt}
              palette='coin'
              title={filter === "spent" ? "Nothing spent yet" : filter === "earned" ? "Nothing earned yet" : "No activity yet"}
              description={
                filter === "spent"
                  ? "Redeem a reward or clear a penalty and it shows up here."
                  : "Claim a task from the market. When your manager approves it, the credits land here."
              }
            >
              <Button asChild>
                <Link to={filter === "spent" ? "/store" : "/market"}>{filter === "spent" ? "Browse the store" : "Open the market"}</Link>
              </Button>
            </EmptyState>
          </Box>
        )}
      </Box>
      <Stack gridArea='side' gap={3} minW={0}>
        {activePenalties.length > 0 ? (
          <Callout
            to='/store/penalties'
            icon={LuShieldAlert}
            palette='red'
            title={`${activePenalties.length} active ${activePenalties.length === 1 ? "penalty" : "penalties"}`}
            description={`${formatNumber(owed)} credits clears ${activePenalties.length === 1 ? "it" : "them all"}.`}
          />
        ) : (
          <Callout to='/store/penalties' icon={LuShieldAlert} palette='green' title='No penalties' description='Clean record. Keep it up!' />
        )}
        <Callout
          to='/store/redemptions'
          icon={LuHourglass}
          palette={pending.length ? "orange" : "brand"}
          title={pending.length ? `${pending.length} ${pending.length === 1 ? "reward" : "rewards"} on the way` : "Your redemptions"}
          description={pending.length ? "Waiting for your manager to hand over." : "Everything you've bought from the store."}
        />
      </Stack>
    </Grid>
  );
};

// Managers don't earn credits; their wallet view is the team's economy.
const TeamWallet = () => {
  const team = useTeam();
  const redemptions = useRedemptions();
  const penalties = usePenalties();
  const [penaltyFor, setPenaltyFor] = useState(null);

  const members = team.data ?? [];
  const teamBalance = members.reduce((sum, m) => sum + m.credits, 0);
  const pending = (redemptions.data ?? []).filter((r) => r.status === "pending").length;
  const active = (penalties.data ?? []).filter((p) => p.status === "active").length;

  if (team.isError) return <LoadError what='your team' onRetry={team.refetch} />;

  return (
    <Stack gap={{ base: 5, md: 6 }}>
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
        <StatTile label='Team balance' value={formatNumber(teamBalance)} icon={LuReceipt} palette='coin' hint='Held by your team' />
        <StatTile label='People' value={members.length} icon={LuUsers} palette='brand' />
        <StatTile label='To fulfil' value={pending} icon={LuGift} palette='orange' to='/store/redemptions' hint='Pending redemptions' />
        <StatTile label='Active penalties' value={active} icon={LuShieldAlert} palette='red' to='/store/penalties' />
      </SimpleGrid>
      <Box>
        <SectionHeader title='Wallets' count={team.isLoading ? undefined : members.length} />
        {team.isLoading ? (
          <SkeletonRows count={3} />
        ) : members.length === 0 ? (
          <Box layerStyle='panel'>
            <EmptyState
              icon={LuUsers}
              title='No one reports to you yet'
              description='When workers sign up and pick you as their manager, their wallets show up here.'
            />
          </Box>
        ) : (
          <Stack gap={0} layerStyle='panel' overflow='hidden' animation='fade-up' css={{ "& > * + *": { borderTopWidth: "1px", borderColor: "border" } }}>
            {members.map((member) => (
              <Flex key={member._id} align='center' gap={3} px={{ base: 3, md: 4 }} py={3}>
                <UserAvatar name={member.name} size='md' />
                <Box flex='1' minW={0}>
                  <HStack gap={2} minW={0}>
                    <Text fontWeight='semibold' lineClamp={1}>
                      {member.name}
                    </Text>
                    {member.activePenalties > 0 && (
                      <Badge colorPalette='red' variant='subtle' size='sm' flexShrink={0} aria-label={`${member.activePenalties} active penalties`}>
                        <LuShieldAlert /> {member.activePenalties}
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize='xs' color='fg.muted' mt={0.5} lineClamp={1}>
                    Level {member.level} · {member.tasksDone} done
                    {member.tasksInReview > 0 && ` · ${member.tasksInReview} in review`}
                  </Text>
                </Box>
                <CreditAmount value={member.credits} fontWeight='bold' flexShrink={0} />
                <Button
                  size='sm'
                  variant='outline'
                  colorPalette='red'
                  minH={{ base: 11, md: 9 }}
                  minW={{ base: 11, md: 9 }}
                  px={{ base: 0, sm: 3 }}
                  flexShrink={0}
                  aria-label={`Issue a penalty to ${member.name}`}
                  onClick={() => setPenaltyFor(member._id)}
                >
                  <LuGavel />
                  <Box as='span' display={{ base: "none", sm: "inline" }}>
                    Penalty
                  </Box>
                </Button>
              </Flex>
            ))}
          </Stack>
        )}
      </Box>
      <PenaltyFormDialog open={Boolean(penaltyFor)} workerId={penaltyFor} onClose={() => setPenaltyFor(null)} />
    </Stack>
  );
};

const WalletPage = () => {
  const { profile, isLoading } = useMe();
  const isManager = profile?.role === "manager";
  return (
    <>
      <PageHeader
        eyebrow='Wallet'
        title={isManager ? "Team wallets" : "Your credits"}
        description={
          isManager
            ? "What your team has earned, what they're waiting for and who owes a penalty."
            : "Every payout and purchase, and what you have left to spend."
        }
      />
      {isLoading ? <SkeletonRows count={3} h='20' /> : !profile ? <GameLocked /> : isManager ? <TeamWallet /> : <WorkerWallet />}
    </>
  );
};

export default WalletPage;
