import { Box, Button, Flex, Icon, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuGavel, LuShieldAlert, LuShieldCheck } from "react-icons/lu";
import api from "../api/api";
import PenaltyCard from "../components/PenaltyCard";
import PenaltyFormDialog from "../components/PenaltyFormDialog";
import StoreTabs from "../components/StoreTabs";
import { GameLocked, LoadError, SkeletonRows } from "../components/EconomyStates";
import CoinBurst from "../components/ui/CoinBurst";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CreditAmount from "../components/ui/CreditAmount";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHeader from "../components/ui/PageHeader";
import { toaster } from "../components/ui/toaster";
import useCoinBurst from "../hooks/useCoinBurst";
import useMe from "../hooks/useMe";
import usePenalties from "../hooks/usePenalties";
import { formatNumber } from "../lib/game";
import { apiErrorMessage } from "../lib/store";

// Red banner with what a worker owes in total.
const OwedSummary = ({ count, owed, balance }) => (
  <Flex
    colorPalette={count ? "red" : "green"}
    layerStyle='panel'
    borderColor='colorPalette.muted'
    bg='colorPalette.subtle'
    align='center'
    gap={4}
    p={{ base: 4, md: 5 }}
    mb={{ base: 4, md: 5 }}
    animation='fade-up'
  >
    <Flex boxSize={12} rounded='full' bg='bg.panel' color='colorPalette.fg' align='center' justify='center' flexShrink={0}>
      <Icon as={count ? LuShieldAlert : LuShieldCheck} boxSize={6} />
    </Flex>
    <Box flex='1' minW={0}>
      <Text fontWeight='bold' fontSize={{ base: "md", md: "lg" }}>
        {count ? `${count} active ${count === 1 ? "penalty" : "penalties"}` : "Clean record"}
      </Text>
      <Text fontSize='sm' color='fg.muted'>
        {count ? (
          <>
            {formatNumber(owed)} credits clears {count === 1 ? "it" : "them all"}. You have{" "}
            <CreditAmount value={balance} size='sm' fontWeight='bold' verticalAlign='middle' />.
          </>
        ) : (
          "No penalties to clear. Nice work."
        )}
      </Text>
    </Box>
  </Flex>
);

const PenaltyGrid = ({ children }) => (
  <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 3, md: 4 }}>
    {children}
  </SimpleGrid>
);

const WorkerPenalties = ({ profile }) => {
  const queryClient = useQueryClient();
  const penalties = usePenalties();
  const [selected, setSelected] = useState(null);
  const [burst, fireBurst] = useCoinBurst();

  const clear = useMutation({
    mutationFn: (penalty) => api.post(`/penalties/${penalty._id}/clear`),
    onSuccess: (_, penalty) => {
      setSelected(null);
      fireBurst("Cleared!");
      toaster.create({ title: "Penalty cleared", description: `${penalty.reason}. Fresh start!`, type: "success" });
    },
    onError: (error) => {
      setSelected(null);
      toaster.create({ title: "Couldn't clear the penalty", description: apiErrorMessage(error), type: "error" });
    },
    onSettled: () => Promise.all(["me", "wallet", "penalties"].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))),
  });

  if (penalties.isLoading) return <SkeletonRows count={2} h='28' />;
  if (penalties.isError) return <LoadError what='your penalties' onRetry={penalties.refetch} />;

  const all = penalties.data ?? [];
  const active = all.filter((p) => p.status === "active");
  const cleared = all.filter((p) => p.status === "cleared");
  const owed = active.reduce((sum, p) => sum + p.cost, 0);

  return (
    <>
      <OwedSummary count={active.length} owed={owed} balance={profile.credits} />
      {active.length > 0 && (
        <PenaltyGrid>
          {active.map((penalty) => (
            <PenaltyCard key={penalty._id} penalty={penalty} balance={profile.credits} onClear={setSelected} />
          ))}
        </PenaltyGrid>
      )}
      {cleared.length > 0 && (
        <Stack gap={3} mt={active.length ? { base: 6, md: 8 } : 0}>
          <Text textStyle='eyebrow' color='fg.subtle'>
            Cleared
          </Text>
          <PenaltyGrid>
            {cleared.map((penalty) => (
              <PenaltyCard key={penalty._id} penalty={penalty} />
            ))}
          </PenaltyGrid>
        </Stack>
      )}
      <ConfirmDialog
        open={Boolean(selected)}
        onClose={() => !clear.isPending && setSelected(null)}
        onConfirm={() => clear.mutate(selected)}
        loading={clear.isPending}
        palette='coin'
        icon={LuShieldCheck}
        title='Clear this penalty?'
        description={
          selected
            ? `“${selected.reason}” is wiped from your record for ${formatNumber(selected.cost)} credits. You'll have ${formatNumber(
                profile.credits - selected.cost,
              )} left.`
            : ""
        }
        confirmLabel={selected ? `Pay ${formatNumber(selected.cost)} credits` : "Clear"}
      />
      <CoinBurst burst={burst} />
    </>
  );
};

const ManagerPenalties = ({ issuing, setIssuing }) => {
  const penalties = usePenalties();
  const [filter, setFilter] = useState("active");

  if (penalties.isLoading) return <SkeletonRows count={2} h='28' />;
  if (penalties.isError) return <LoadError what='penalties' onRetry={penalties.refetch} />;

  const all = penalties.data ?? [];
  const active = all.filter((p) => p.status === "active");
  const cleared = all.filter((p) => p.status === "cleared");
  const visible = filter === "active" ? active : filter === "cleared" ? cleared : all;

  return (
    <>
      <FilterChips
        label='Filter penalties'
        value={filter}
        onChange={setFilter}
        options={[
          { value: "active", label: "Active", count: active.length },
          { value: "cleared", label: "Cleared", count: cleared.length },
          { value: "all", label: "All", count: all.length },
        ]}
        mb={{ base: 4, md: 5 }}
      />
      {visible.length === 0 ? (
        <Box layerStyle='panel'>
          <EmptyState
            icon={LuShieldCheck}
            palette='green'
            title={filter === "cleared" ? "Nothing cleared yet" : all.length ? "No active penalties" : "No penalties issued"}
            description={
              filter === "cleared"
                ? "When someone pays off a penalty, it moves here."
                : "Your team is in the clear. If someone slips up, issue a penalty they can pay off with credits."
            }
          >
            {filter !== "cleared" && (
              <Button variant='outline' colorPalette='gray' onClick={() => setIssuing(true)}>
                <LuGavel /> Issue a penalty
              </Button>
            )}
          </EmptyState>
        </Box>
      ) : (
        <PenaltyGrid>
          {visible.map((penalty) => (
            <PenaltyCard key={penalty._id} penalty={penalty} showWorker />
          ))}
        </PenaltyGrid>
      )}
      <PenaltyFormDialog open={issuing} onClose={() => setIssuing(false)} />
    </>
  );
};

const PenaltiesPage = () => {
  const { profile, isLoading } = useMe();
  const isManager = profile?.role === "manager";
  const [issuing, setIssuing] = useState(false);
  return (
    <>
      <PageHeader
        eyebrow='Rewards store'
        title={isManager ? "Team penalties" : "Your penalties"}
        description={
          isManager
            ? "Penalties you've issued. Your team clears them with the credits they earn."
            : "Made a mistake? Spend credits to clear a penalty from your record."
        }
        actions={
          isManager && (
            <Button colorPalette='red' onClick={() => setIssuing(true)}>
              <LuGavel /> Issue penalty
            </Button>
          )
        }
      />
      {profile && <StoreTabs />}
      {isLoading ? (
        <SkeletonRows count={2} h='28' />
      ) : !profile ? (
        <GameLocked />
      ) : isManager ? (
        <ManagerPenalties issuing={issuing} setIssuing={setIssuing} />
      ) : (
        <WorkerPenalties profile={profile} />
      )}
    </>
  );
};

export default PenaltiesPage;
