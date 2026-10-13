import useMe from "../hooks/useMe";
import usePenalties from "../hooks/usePenalties";
import useRedemptions from "../hooks/useRedemptions";
import SegmentedNav from "./ui/SegmentedNav";

// Sub-navigation for the store area: rewards, redemptions and penalties.
// Badges count what needs attention: pending redemptions (for a manager, the
// ones to fulfil) and, for a worker, active penalties.
const StoreTabs = (props) => {
  const { profile } = useMe();
  const redemptions = useRedemptions();
  const penalties = usePenalties();
  const isManager = profile?.role === "manager";
  const pending = (redemptions.data ?? []).filter((r) => r.status === "pending").length;
  const active = (penalties.data ?? []).filter((p) => p.status === "active").length;
  return (
    <SegmentedNav
      label='Store sections'
      tabs={[
        { to: "/store", label: "Rewards", end: true },
        { to: "/store/redemptions", label: "Redemptions", shortLabel: "Redeemed", count: pending, palette: "orange" },
        { to: "/store/penalties", label: "Penalties", count: isManager ? 0 : active, palette: "red" },
      ]}
      mb={{ base: 5, md: 6 }}
      {...props}
    />
  );
};

export default StoreTabs;
