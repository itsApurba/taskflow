import { SimpleGrid, Skeleton } from "@chakra-ui/react";
import SprintCard from "./SprintCard";
import { sortSprints } from "../lib/sprints";

const SprintList = ({ sprints, isLoading, refetch, empty }) => {
  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h='52' rounded='l3' />
        ))}
      </SimpleGrid>
    );
  }
  if (!sprints?.length) return empty ?? null;
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
      {sortSprints(sprints).map((sprint) => (
        <SprintCard key={sprint._id} sprint={sprint} refetch={refetch} />
      ))}
    </SimpleGrid>
  );
};

export default SprintList;
