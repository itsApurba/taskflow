import { Box, Button, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuGift, LuPlus, LuTrash2 } from "react-icons/lu";
import { Link } from "react-router-dom";
import api from "../api/api";
import RewardCard from "../components/RewardCard";
import RewardFormDialog from "../components/RewardFormDialog";
import StoreTabs from "../components/StoreTabs";
import { GameLocked, LoadError, NoManager, SkeletonCards } from "../components/EconomyStates";
import CoinBurst from "../components/ui/CoinBurst";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CreditAmount from "../components/ui/CreditAmount";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHeader from "../components/ui/PageHeader";
import { toaster } from "../components/ui/toaster";
import useCoinBurst from "../hooks/useCoinBurst";
import useMe from "../hooks/useMe";
import useRedemptions from "../hooks/useRedemptions";
import useRewards from "../hooks/useRewards";
import { firstName, formatNumber } from "../lib/game";
import { apiErrorMessage, isSoldOut } from "../lib/store";

const RewardGrid = ({ children }) => (
  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, md: 5 }}>
    {children}
  </SimpleGrid>
);

const WorkerStore = ({ profile }) => {
  const queryClient = useQueryClient();
  const rewards = useRewards();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [burst, fireBurst] = useCoinBurst();
  const balance = profile.credits;

  const redeem = useMutation({
    mutationFn: (reward) => api.post(`/rewards/${reward._id}/redeem`),
    onSuccess: (_, reward) => {
      setSelected(null);
      fireBurst("Redeemed!");
      toaster.create({
        title: `Redeemed: ${reward.title}`,
        description: `${firstName(profile.manager?.name || "Your manager")} will hand it over. Track it under Redemptions.`,
        type: "success",
      });
    },
    onError: (error) => {
      setSelected(null);
      toaster.create({ title: "Couldn't redeem", description: apiErrorMessage(error), type: "error" });
    },
    // Balance, stock and the redemption list all change (or were stale on a 409).
    onSettled: () => Promise.all(["me", "wallet", "rewards", "redemptions"].map((key) => queryClient.invalidateQueries({ queryKey: [key] }))),
  });

  if (!profile.reportsTo) return <NoManager />;
  if (rewards.isError) return <LoadError what='the store' onRetry={rewards.refetch} />;

  const all = rewards.data ?? [];
  const affordable = all.filter((r) => !isSoldOut(r) && r.cost <= balance);
  const visible = filter === "affordable" ? affordable : all;
  const after = selected ? balance - selected.cost : 0;

  return (
    <>
      <FilterChips
        label='Filter rewards'
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All rewards", count: all.length },
          { value: "affordable", label: "You can afford", count: affordable.length },
        ]}
        mb={{ base: 4, md: 5 }}
      />
      {rewards.isLoading ? (
        <SkeletonCards />
      ) : visible.length === 0 ? (
        <Box layerStyle='panel'>
          {all.length === 0 ? (
            <EmptyState
              icon={LuGift}
              palette='coin'
              title='The store is empty'
              description={`${firstName(profile.manager?.name || "Your manager")} hasn't stocked any rewards yet. Keep earning; they'll be worth it.`}
            />
          ) : (
            <EmptyState
              icon={LuGift}
              palette='coin'
              title='Nothing in reach yet'
              description={`The cheapest reward is ${formatNumber(Math.min(...all.map((r) => r.cost)))} credits. Claim a task to get there.`}
            >
              <Button asChild>
                <Link to='/market'>Open the market</Link>
              </Button>
            </EmptyState>
          )}
        </Box>
      ) : (
        <RewardGrid>
          {visible.map((reward) => (
            <RewardCard key={reward._id} reward={reward} balance={balance} onRedeem={setSelected} />
          ))}
        </RewardGrid>
      )}
      <ConfirmDialog
        open={Boolean(selected)}
        onClose={() => !redeem.isPending && setSelected(null)}
        onConfirm={() => redeem.mutate(selected)}
        loading={redeem.isPending}
        palette='coin'
        icon={LuGift}
        title={selected ? `Redeem “${selected.title}”?` : ""}
        description={
          selected
            ? `${formatNumber(selected.cost)} credits leave your wallet and you'll have ${formatNumber(after)} left. ${firstName(
                profile.manager?.name || "Your manager",
              )} gets a request to hand it over.`
            : ""
        }
        confirmLabel={selected ? `Redeem for ${formatNumber(selected.cost)}` : "Redeem"}
      />
      <CoinBurst burst={burst} />
    </>
  );
};

// `editing` is the reward in the form dialog, {} for a new one, or null.
const ManagerStore = ({ editing, setEditing }) => {
  const queryClient = useQueryClient();
  const rewards = useRewards();
  const redemptions = useRedemptions();
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["rewards"] });
  const toggle = useMutation({
    mutationFn: (reward) => api.patch(`/rewards/${reward._id}`, { active: !reward.active }),
    onSuccess: ({ data }) => toaster.create({ title: data.active ? "Back in the store" : "Hidden from the store", description: data.title, type: "success" }),
    onError: (error) => toaster.create({ title: "Couldn't update the reward", description: apiErrorMessage(error), type: "error" }),
    onSettled: refresh,
  });
  const remove = useMutation({
    mutationFn: (reward) => api.delete(`/rewards/${reward._id}`),
    onSuccess: ({ data }) => {
      setDeleting(null);
      toaster.create({ title: "Reward deleted", description: data.title, type: "success" });
    },
    onError: (error) => toaster.create({ title: "Couldn't delete the reward", description: apiErrorMessage(error), type: "error" }),
    onSettled: refresh,
  });

  if (rewards.isError) return <LoadError what='your store' onRetry={rewards.refetch} />;

  const all = rewards.data ?? [];
  const live = all.filter((r) => r.active);
  const hidden = all.filter((r) => !r.active);
  const visible = filter === "live" ? live : filter === "hidden" ? hidden : all;
  const redeemed = (redemptions.data ?? []).reduce((counts, r) => {
    const id = r.reward?._id;
    if (id) counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <>
      <FilterChips
        label='Filter rewards'
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "All", count: all.length },
          { value: "live", label: "Live", count: live.length },
          { value: "hidden", label: "Hidden", count: hidden.length },
        ]}
        mb={{ base: 4, md: 5 }}
      />
      {rewards.isLoading ? (
        <SkeletonCards />
      ) : visible.length === 0 ? (
        <Box layerStyle='panel'>
          <EmptyState
            icon={LuGift}
            palette='coin'
            title={all.length ? "Nothing here" : "Stock your store"}
            description={
              all.length ? "No rewards match this filter." : "Add rewards your team will want to earn: an event ticket, a day off, a weekend outing with you."
            }
          >
            {!all.length && (
              <Button onClick={() => setEditing({})}>
                <LuPlus /> Add the first reward
              </Button>
            )}
          </EmptyState>
        </Box>
      ) : (
        <RewardGrid>
          {visible.map((reward) => (
            <RewardCard
              key={reward._id}
              reward={reward}
              redeemedCount={redemptions.data ? (redeemed[reward._id] ?? 0) : undefined}
              onEdit={setEditing}
              onToggle={(r) => toggle.mutate(r)}
              onDelete={setDeleting}
            />
          ))}
        </RewardGrid>
      )}
      <RewardFormDialog key={editing?._id ?? "new"} open={Boolean(editing)} reward={editing?._id ? editing : undefined} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => !remove.isPending && setDeleting(null)}
        onConfirm={() => remove.mutate(deleting)}
        loading={remove.isPending}
        icon={LuTrash2}
        title={deleting ? `Delete “${deleting.title}”?` : ""}
        description='It leaves the store for good. Past redemptions keep its name. To bring it back later, hide it instead.'
        confirmLabel='Delete reward'
      />
    </>
  );
};

const StorePage = () => {
  const { profile, isLoading } = useMe();
  const isManager = profile?.role === "manager";
  const [editing, setEditing] = useState(null);
  return (
    <>
      <PageHeader
        eyebrow='Rewards store'
        title={isManager ? "Your store" : "Spend your credits"}
        description={
          isManager
            ? "Stock rewards your team can buy with the credits they earn."
            : profile?.manager
              ? `Rewards ${firstName(profile.manager.name)} stocks for the team.`
              : "Rewards your manager stocks for the team."
        }
        // Workers see their balance here; on phones the top bar already shows it.
        actionsProps={isManager ? undefined : { display: { base: "none", sm: "flex" } }}
        actions={
          profile &&
          (isManager ? (
            <Button onClick={() => setEditing({})}>
              <LuPlus /> New reward
            </Button>
          ) : (
            <HStack layerStyle='panel' rounded='full' px={4} minH={11} gap={2} justify='center' borderColor='coin.muted'>
              <Text fontSize='sm' color='fg.muted' fontWeight='semibold'>
                You have
              </Text>
              <CreditAmount value={profile.credits} fontWeight='bold' />
            </HStack>
          ))
        }
      />
      {profile && <StoreTabs />}
      {isLoading ? (
        <SkeletonCards />
      ) : !profile ? (
        <GameLocked />
      ) : isManager ? (
        <ManagerStore editing={editing} setEditing={setEditing} />
      ) : (
        <WorkerStore profile={profile} />
      )}
    </>
  );
};

export default StorePage;
