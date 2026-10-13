import { Button, Skeleton, Stack } from "@chakra-ui/react";
import moment from "moment";
import { LuPlus, LuRefreshCw, LuStore, LuTriangleAlert } from "react-icons/lu";
import { Link } from "react-router-dom";
import ManagerHome from "../components/home/ManagerHome";
import WorkerHome from "../components/home/WorkerHome";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import useAuth from "../hooks/useAuth";
import useMe from "../hooks/useMe";
import useTasks from "../hooks/useTasks";
import { firstName } from "../lib/game";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Home answers "what should I do next?": managers see their review queue and
// team, workers their next task, penalties and reward goals.
const Dashboard = () => {
  const { userName } = useAuth();
  const { profile, isFirstLoad, isLoadError, refetch, isFetching } = useMe();
  const tasks = useTasks();
  const isManager = profile?.role === "manager";

  const header = (description) => (
    <PageHeader
      eyebrow={moment().format("dddd, D MMMM")}
      title={`${greeting()}, ${firstName(userName)}`}
      description={description}
      // Phones reach the market from the tab bar; here the next-up card leads.
      actionsProps={{ display: { base: "none", sm: "flex" } }}
      actions={
        // The CTA depends on the role, which is unknown until /me answers.
        !isFirstLoad && !isLoadError && (
          <Button asChild>
            <Link to={isManager ? "/market/new" : "/market"}>
              {isManager ? (
                <>
                  <LuPlus /> Post a task
                </>
              ) : (
                <>
                  <LuStore /> Find a task
                </>
              )}
            </Link>
          </Button>
        )
      }
    />
  );

  if (isFirstLoad) {
    return (
      <>
        {header("Loading your board…")}
        <Stack gap={5}>
          <Skeleton h='40' rounded='l3' />
          <Skeleton h='52' rounded='l3' />
        </Stack>
      </>
    );
  }

  // Without /me the role is unknown; ask to retry rather than guess a worker.
  if (isLoadError) {
    return (
      <>
        {header("Your board is one step away.")}
        <EmptyState icon={LuTriangleAlert} palette='red' title="Couldn't load your board" description='Check your connection and try again.' layerStyle='panel'>
          <Button onClick={() => refetch()} loading={isFetching}>
            <LuRefreshCw /> Try again
          </Button>
        </EmptyState>
      </>
    );
  }

  if (isManager) return <ManagerHome header={header} />;
  return <WorkerHome profile={profile} tasks={tasks.data ?? []} isLoading={tasks.isLoading} header={header} />;
};

export default Dashboard;
