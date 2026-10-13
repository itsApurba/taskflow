import { Box, Button, Field as ChakraField, Flex, Grid, Input, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";
import { toaster } from "./ui/toaster";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import api from "../api/api";
import moment from "moment";
import { useQueryClient } from "@tanstack/react-query";
import { LuCalendarX, LuListTodo } from "react-icons/lu";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import AssignSprintField from "./AssignSprintField";
import TaskRow from "./TaskRow";
import EmptyState from "./ui/EmptyState";
import PageHeader from "./ui/PageHeader";
import SectionHeader from "./ui/SectionHeader";
import useGoBack from "../hooks/useGoBack";
import useSprints from "../hooks/useSprints";
import useTasks from "../hooks/useTasks";

const SprintSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  startDate: Yup.date().default(Date.now),
  endDate: Yup.date().required("Required"),
  tasks: Yup.array(),
});

// <input type="date"> needs YYYY-MM-DD.
const toDateInput = (date) => moment(date).format("YYYY-MM-DD");

const CreateSprint = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack("/sprints");
  const queryClient = useQueryClient();
  // There is no GET /sprints/:id, so a deep link finds the sprint in the list.
  const sprints = useSprints();
  const { data: allTasks = [] } = useTasks();
  const sprint = state?.sprint ?? sprints.data?.find((s) => s._id === id);

  const header = (
    <PageHeader
      back='/sprints'
      eyebrow={id ? "Edit sprint" : "New sprint"}
      title={id ? sprint?.name || "Edit sprint" : "Plan a sprint"}
      description={id ? "Adjust the dates and tasks." : "Pick a finish line and the tasks that belong in it."}
    />
  );

  if (id && !sprint) {
    return (
      <Box maxW='2xl'>
        {header}
        {sprints.isLoading ? (
          <Skeleton h='80' rounded='l3' />
        ) : (
          <EmptyState icon={LuCalendarX} title='Sprint not found' description='It may have been deleted.' layerStyle='panel'>
            <Button asChild>
              <Link to='/sprints'>Back to sprints</Link>
            </Button>
          </EmptyState>
        )}
      </Box>
    );
  }

  const initValue = {
    name: sprint?.name || "",
    startDate: toDateInput(sprint?.startDate ?? new Date()),
    endDate: toDateInput(sprint?.endDate ?? moment().add(14, "days")),
    tasks: sprint?.tasks || [],
  };
  const sprintTasks = id ? (sprint.tasks ?? []).map((taskId) => allTasks.find((task) => task._id === taskId)).filter(Boolean) : [];

  return (
    <>
      {header}
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: id ? "minmax(0, 1.4fr) minmax(0, 1fr)" : "minmax(0, 42rem)" }}
        gap={{ base: 5, md: 6 }}
        alignItems='start'
      >
        <Box layerStyle='panel' p={{ base: 4, md: 7 }} animation='fade-up'>
          <Formik
            initialValues={initValue}
            validationSchema={SprintSchema}
            onSubmit={async (values) => {
              const startDate = moment(values.startDate).format();
              const endDate = moment(values.endDate).format();
              const updatedValues = {
                name: values.name,
                startDate,
                endDate,
                tasks: values.tasks,
              };
              if (id) {
                try {
                  const res = await api.patch(`/sprints/${id}`, updatedValues);
                  await queryClient.refetchQueries({ queryKey: ["sprints"] });
                  toaster.create({
                    title: "Update Success",
                    description: res.data.message,
                    type: "success",
                  });
                  goBack();
                } catch (error) {
                  toaster.create({
                    title: "Error",
                    description: error.message,
                    type: "error",
                  });
                }
              } else {
                try {
                  const res = await api.post("/sprints", updatedValues);
                  await queryClient.refetchQueries({ queryKey: ["sprints"] });
                  toaster.create({
                    title: "Sprint created",
                    description: res.data.message,
                    type: "success",
                  });
                  navigate("/sprints");
                } catch (error) {
                  toaster.create({
                    title: "Error",
                    description: error.message,
                    type: "error",
                  });
                }
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form noValidate>
                <Stack gap={5}>
                  <ChakraField.Root invalid={errors.name && touched.name}>
                    <ChakraField.Label>Name</ChakraField.Label>
                    <Field as={Input} type='text' name='name' placeholder='e.g. Sprint 15 · Rewards store' />
                    <ChakraField.ErrorText>
                      <ErrorMessage name='name' />
                    </ChakraField.ErrorText>
                  </ChakraField.Root>

                  <SimpleGrid columns={2} gap={3}>
                    <ChakraField.Root invalid={errors.startDate && touched.startDate}>
                      <ChakraField.Label>Start date</ChakraField.Label>
                      <Field as={Input} type='date' name='startDate' />
                      <ChakraField.ErrorText>
                        <ErrorMessage name='startDate' />
                      </ChakraField.ErrorText>
                    </ChakraField.Root>

                    <ChakraField.Root invalid={errors.endDate && touched.endDate}>
                      <ChakraField.Label>End date</ChakraField.Label>
                      <Field as={Input} type='date' name='endDate' />
                      <ChakraField.ErrorText>
                        <ErrorMessage name='endDate' />
                      </ChakraField.ErrorText>
                    </ChakraField.Root>
                  </SimpleGrid>

                  <AssignSprintField name='tasks' />

                  <Flex direction={{ base: "column-reverse", sm: "row" }} justify='flex-end' gap={2} pt={2}>
                    <Button variant='outline' colorPalette='gray' onClick={goBack}>
                      Cancel
                    </Button>
                    <Button type='submit' loading={isSubmitting}>
                      {!id ? "Create Sprint" : "Update Sprint"}
                    </Button>
                  </Flex>
                </Stack>
              </Form>
            )}
          </Formik>
        </Box>
        {id && (
          <Box layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
            <SectionHeader title='Tasks in this sprint' count={sprintTasks.length} px={2} pt={1} mb={1} as='h2' />
            {sprintTasks.length ? (
              <Stack gap={0.5}>
                {sprintTasks.map((task) => (
                  <TaskRow key={task._id} task={task} />
                ))}
              </Stack>
            ) : (
              <EmptyState size='sm' icon={LuListTodo} title='No tasks yet' description='Search for tasks in the form to add them.' />
            )}
          </Box>
        )}
      </Grid>
    </>
  );
};

export default CreateSprint;
