import { Button, Skeleton, Stack } from "@chakra-ui/react";
import moment from "moment";
import { LuPlus } from "react-icons/lu";
import { Link } from "react-router-dom";
import ManagerHome from "../components/home/ManagerHome";
import WorkerHome from "../components/home/WorkerHome";
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
  const { profile, isLoading: profileLoading } = useMe();
  const tasks = useTasks();
  const isManager = profile?.role === "manager";

  const header = (description) => (
    <PageHeader
      eyebrow={moment().format("dddd, D MMMM")}
      title={`${greeting()}, ${firstName(userName)}`}
      description={description}
      // Phones create tasks from the Board tab; here the next-up card leads.
      actionsProps={{ display: { base: "none", sm: "flex" } }}
      actions={
        <Button asChild>
          <Link to={isManager ? "/market" : "/create-task"}>
            <LuPlus /> {isManager ? "Post a task" : "New task"}
          </Link>
        </Button>
      }
    />
  );

  if (profileLoading) {
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

  if (isManager) return <ManagerHome header={header} />;
  return <WorkerHome profile={profile} tasks={tasks.data ?? []} isLoading={tasks.isLoading} refetch={tasks.refetch} header={header} />;
};

export default Dashboard;
