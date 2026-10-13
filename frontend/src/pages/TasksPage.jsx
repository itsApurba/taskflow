import { Button, Flex, Input, InputGroup, NativeSelect } from "@chakra-ui/react";
import { useState } from "react";
import { LuPlus, LuSearch, LuSearchX, LuSquareKanban } from "react-icons/lu";
import { Link, useSearchParams } from "react-router-dom";
import BoardTabs from "../components/BoardTabs";
import TaskList from "../components/TaskList";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHeader from "../components/ui/PageHeader";
import useAuth from "../hooks/useAuth";
import useMe from "../hooks/useMe";
import useTasks from "../hooks/useTasks";
import { TASK_LANES, assigneeId, getTaskStatus } from "../lib/game";

const SCOPES = [
  { value: "all", label: "Everyone" },
  { value: "mine", label: "Mine" },
  { value: "open", label: "Unassigned" },
];

// The task board. Lane and scope live in the URL (?lane=active&scope=mine) so
// dashboard tiles can link straight to a filtered view.
const TasksPage = () => {
  const { userId } = useAuth();
  const { profile } = useMe();
  const canPost = profile?.role !== "worker";
  const { data: tasks, isLoading } = useTasks();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const lane = params.get("lane") ?? "all";
  const scope = params.get("scope") ?? "all";

  const setFilter = (key, value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "all") next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );

  const inScope = (tasks ?? []).filter((task) => {
    if (scope === "mine") return assigneeId(task) === userId;
    if (scope === "open") return !assigneeId(task);
    return true;
  });
  const search = query.trim().toLowerCase();
  const matching = search ? inScope.filter((task) => task.title.toLowerCase().includes(search)) : inScope;
  const visible = lane === "all" ? matching : matching.filter((task) => getTaskStatus(task.status).lane === lane);
  const laneOptions = [
    { value: "all", label: "All", count: matching.length },
    ...TASK_LANES.map((l) => ({ value: l.id, label: l.label, count: matching.filter((task) => getTaskStatus(task.status).lane === l.id).length })),
  ];
  const filtered = lane !== "all" || scope !== "all" || search;

  return (
    <>
      <PageHeader
        eyebrow='Board'
        title='Tasks'
        description='Everything your team is working on.'
        actions={
          canPost && (
            <Button asChild>
              <Link to='/create-task'>
                <LuPlus /> New task
              </Link>
            </Button>
          )
        }
      />
      <BoardTabs mb={5} />
      <Flex gap={2} mb={3}>
        <InputGroup startElement={<LuSearch />} flex='1' maxW={{ md: "sm" }}>
          <Input type='search' name='q' placeholder='Search tasks' aria-label='Search tasks' value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
        <NativeSelect.Root w={{ base: "36", md: "44" }} flexShrink={0}>
          <NativeSelect.Field aria-label='Whose tasks' value={scope} onChange={(e) => setFilter("scope", e.target.value)}>
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Flex>
      <FilterChips label='Task status' options={laneOptions} value={lane} onChange={(value) => setFilter("lane", value)} mb={5} />
      <TaskList
        tasks={visible}
        isLoading={isLoading}
        empty={
          filtered ? (
            <EmptyState icon={LuSearchX} title='No tasks match' description='Try another filter or search term.' layerStyle='panel'>
              <Button
                variant='outline'
                colorPalette='gray'
                onClick={() => {
                  setQuery("");
                  setParams({}, { replace: true });
                }}
              >
                Clear filters
              </Button>
            </EmptyState>
          ) : (
            <EmptyState icon={LuSquareKanban} title='Your board is empty' description={canPost ? "Create the first task and get the team moving." : "Your manager hasn't posted any tasks yet."} layerStyle='panel'>
              {canPost && (
                <Button asChild>
                  <Link to='/create-task'>
                    <LuPlus /> New task
                  </Link>
                </Button>
              )}
            </EmptyState>
          )
        }
      />
    </>
  );
};

export default TasksPage;
