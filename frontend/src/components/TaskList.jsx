import { SimpleGrid, Skeleton } from "@chakra-ui/react";
import TaskCard from "./TaskCard";

// Grid of task cards with a loading skeleton; `empty` renders when there is nothing to show.
const TaskList = ({ tasks, isLoading, empty }) => {
  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h='44' rounded='l3' />
        ))}
      </SimpleGrid>
    );
  }
  if (!tasks?.length) return empty ?? null;
  return (
    <SimpleGrid columns={{ base: 1, xl: 2 }} gap={4}>
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </SimpleGrid>
  );
};

export default TaskList;
