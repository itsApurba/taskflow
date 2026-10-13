import { Button } from "@chakra-ui/react";
import { LuCalendarRange, LuPlus } from "react-icons/lu";
import { Link } from "react-router-dom";
import BoardTabs from "../components/BoardTabs";
import SprintList from "../components/SprintList";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import useSprints from "../hooks/useSprints";

const SprintsPage = () => {
  const { data: sprints, isLoading, refetch } = useSprints();
  return (
    <>
      <PageHeader
        eyebrow='Board'
        title='Sprints'
        description='Time-boxed pushes, active ones first.'
        actions={
          <Button asChild>
            <Link to='/create-sprint'>
              <LuPlus /> New sprint
            </Link>
          </Button>
        }
      />
      <BoardTabs mb={6} />
      <SprintList
        sprints={sprints}
        isLoading={isLoading}
        refetch={refetch}
        empty={
          <EmptyState icon={LuCalendarRange} title='No sprints yet' description='Group tasks into a sprint to give the team a finish line.' layerStyle='panel'>
            <Button asChild>
              <Link to='/create-sprint'>
                <LuPlus /> New sprint
              </Link>
            </Button>
          </EmptyState>
        }
      />
    </>
  );
};

export default SprintsPage;
