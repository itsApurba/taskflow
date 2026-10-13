import { Box, Button, Stack } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LuPackageCheck, LuTicket } from "react-icons/lu";
import { Link } from "react-router-dom";
import api from "../api/api";
import RedemptionRow from "../components/RedemptionRow";
import StoreTabs from "../components/StoreTabs";
import { GameLocked, LoadError, SkeletonRows } from "../components/EconomyStates";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHeader from "../components/ui/PageHeader";
import { toaster } from "../components/ui/toaster";
import useMe from "../hooks/useMe";
import useRedemptions from "../hooks/useRedemptions";
import { firstName } from "../lib/game";
import { apiErrorMessage } from "../lib/store";

const EMPTY = {
  worker: {
    pending: { title: "Nothing on the way", description: "Rewards you redeem wait here until your manager hands them over." },
    fulfilled: { title: "Nothing fulfilled yet", description: "Once your manager hands over a reward, it moves here." },
    all: { title: "No redemptions yet", description: "Spend your credits in the store and your rewards show up here." },
  },
  manager: {
    pending: { title: "You're all caught up", description: "No one is waiting for a reward right now." },
    fulfilled: { title: "Nothing fulfilled yet", description: "Rewards you hand over move here." },
    all: { title: "No redemptions yet", description: "When your team buys rewards from your store, they show up here." },
  },
};

const RedemptionsPage = () => {
  const { profile, isLoading } = useMe();
  const queryClient = useQueryClient();
  const redemptions = useRedemptions();
  const isManager = profile?.role === "manager";
  // Until someone picks a filter, open on what needs attention, or everything when nothing does.
  const [picked, setPicked] = useState(null);

  const fulfill = useMutation({
    mutationFn: (redemption) => api.post(`/redemptions/${redemption._id}/fulfill`),
    onSuccess: (_, redemption) =>
      toaster.create({
        title: "Marked as fulfilled",
        description: `${redemption.rewardTitle} for ${firstName(redemption.worker?.name ?? "")}`.trim(),
        type: "success",
      }),
    onError: (error) => toaster.create({ title: "Couldn't update it", description: apiErrorMessage(error), type: "error" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["redemptions"] }),
  });

  const all = redemptions.data ?? [];
  const pending = all.filter((r) => r.status === "pending");
  const fulfilled = all.filter((r) => r.status === "fulfilled");
  const filter = picked ?? (pending.length || !all.length ? "pending" : "all");
  const visible = filter === "pending" ? pending : filter === "fulfilled" ? fulfilled : all;
  const empty = EMPTY[isManager ? "manager" : "worker"][filter];

  let content;
  if (isLoading || redemptions.isLoading) content = <SkeletonRows count={3} />;
  else if (!profile) content = <GameLocked />;
  else if (redemptions.isError) content = <LoadError what='redemptions' onRetry={redemptions.refetch} />;
  else
    content = (
      <>
        <FilterChips
          label='Filter redemptions'
          value={filter}
          onChange={setPicked}
          options={[
            { value: "pending", label: isManager ? "To fulfil" : "On the way", count: pending.length },
            { value: "fulfilled", label: "Fulfilled", count: fulfilled.length },
            { value: "all", label: "All", count: all.length },
          ]}
          mb={{ base: 4, md: 5 }}
        />
        {visible.length === 0 ? (
          <Box layerStyle='panel'>
            <EmptyState icon={filter === "pending" ? LuPackageCheck : LuTicket} palette={filter === "pending" ? "green" : "coin"} {...empty}>
              {!isManager && filter !== "fulfilled" && (
                <Button asChild>
                  <Link to='/store'>Browse the store</Link>
                </Button>
              )}
            </EmptyState>
          </Box>
        ) : (
          <Stack gap={0} layerStyle='panel' overflow='hidden' animation='fade-up' css={{ "& > * + *": { borderTopWidth: "1px", borderColor: "border" } }}>
            {visible.map((redemption) => (
              <RedemptionRow
                key={redemption._id}
                redemption={redemption}
                managerName={profile.manager?.name}
                onFulfill={isManager ? (r) => fulfill.mutate(r) : undefined}
                fulfilling={fulfill.isPending && fulfill.variables?._id === redemption._id}
              />
            ))}
          </Stack>
        )}
      </>
    );

  return (
    <>
      <PageHeader
        eyebrow='Rewards store'
        title={isManager ? "Team redemptions" : "Your redemptions"}
        description={
          isManager ? "Rewards your team bought. Hand them over, then mark them fulfilled." : "Rewards you bought and whether they've been handed over."
        }
      />
      {profile && <StoreTabs />}
      {content}
    </>
  );
};

export default RedemptionsPage;
