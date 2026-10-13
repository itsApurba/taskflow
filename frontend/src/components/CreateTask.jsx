import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, Field as ChakraField, Flex, Icon, Input, NativeSelect, RadioCard, SimpleGrid, Skeleton, Stack, Text, Textarea } from "@chakra-ui/react";
import { LuFileQuestion } from "react-icons/lu";
import { toaster } from "./ui/toaster";
import api from "../api/api";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import AssignTaskField from "./AssignTaskField";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EmptyState from "./ui/EmptyState";
import useGoBack from "../hooks/useGoBack";
import PageHeader from "./ui/PageHeader";
import { BOARD_STATUSES, TASK_TYPES, assigneeId, getTaskStatus } from "../lib/game";

const TaskSchema = Yup.object().shape({
  title: Yup.string().required("Required").min(1, "Min 1").max(50, "Max 50"),
  type: Yup.string().oneOf(["bug", "feature", "story"], "Invalid task type").required("Required"),
  description: Yup.string().default("").min(1, "Min 1").max(500, "Max 500"),
  assignee: Yup.string(),
  status: Yup.string().oneOf(["not started", "in progress", "completed", "closed"]).default("not started"),
});

const Counter = ({ value, max }) => (
  <Text
    as='span'
    ms='auto'
    fontSize='xs'
    fontWeight='medium'
    color={value.length > max ? "fg.error" : "fg.subtle"}
    fontVariantNumeric='tabular-nums'
    aria-hidden
  >
    {value.length}/{max}
  </Text>
);

const CreateTask = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const goBack = useGoBack("/tasks");

  // A deep link or refresh has no router state, so load the task by id.
  const loaded = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => (await api.get(`/tasks/${id}`)).data,
    enabled: Boolean(id) && !state?.task,
    retry: false,
  });
  const task = state?.task ?? loaded.data;

  const header = (
    <PageHeader
      back='/tasks'
      eyebrow={id ? "Edit task" : "New task"}
      title={id ? task?.title || "Edit task" : "Create a task"}
      description={id ? "Update the details and save." : "Describe the work so anyone can pick it up."}
    />
  );

  if (id && !task) {
    return (
      <Box maxW='2xl'>
        {header}
        {loaded.isLoading ? (
          <Skeleton h='96' rounded='l3' />
        ) : (
          <EmptyState icon={LuFileQuestion} title='Task not found' description='It may have been deleted.' layerStyle='panel'>
            <Button asChild>
              <Link to='/tasks'>Back to the board</Link>
            </Button>
          </EmptyState>
        )}
      </Box>
    );
  }

  const initValue = {
    title: task?.title || "",
    type: task?.type || "",
    description: task?.description || "",
    assignee: assigneeId(task) || "",
    status: task?.status || "not started",
  };

  return (
    <Box maxW='2xl'>
      {header}
      <Box layerStyle='panel' p={{ base: 4, md: 7 }} animation='fade-up'>
        <Formik
          initialValues={initValue}
          validationSchema={TaskSchema}
          onSubmit={async (values) => {
            // No assignee is sent as null (unassigned); an empty string fails the save.
            const body = { ...values, assignee: values.assignee || null };
            try {
              if (!id) {
                await api.post("/tasks", body);
                await queryClient.refetchQueries({ queryKey: ["tasks"] });
                navigate("/tasks");
              } else {
                await api.patch(`/tasks/${id}`, body);
                await queryClient.refetchQueries({ queryKey: ["tasks"] });
                goBack();
              }
              toaster.create({
                title: id ? "Task updated" : "Task created",
                description: id ? undefined : "It's on the board now.",
                type: "success",
              });
            } catch {
              toaster.create({
                title: "Something went wrong",
                type: "error",
              });
            }
          }}
        >
          {({ isSubmitting, errors, touched, values, setFieldValue, setFieldTouched }) => (
            <Form noValidate>
              <Stack gap={5}>
                <ChakraField.Root invalid={errors.title && touched.title}>
                  <ChakraField.Label w='full'>
                    Title <Counter value={values.title} max={50} />
                  </ChakraField.Label>
                  <Field as={Input} type='text' name='title' placeholder='e.g. Fix the login redirect on Safari' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='title' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root invalid={errors.description && touched.description}>
                  <ChakraField.Label w='full'>
                    Description <Counter value={values.description} max={500} />
                  </ChakraField.Label>
                  <Field as={Textarea} name='description' rows={4} autoresize placeholder='What needs doing, and how will we know it is done?' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='description' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root invalid={errors.type && touched.type}>
                  <RadioCard.Root
                    name='type'
                    value={values.type || null}
                    onValueChange={(e) => setFieldValue("type", e.value)}
                    orientation='vertical'
                    align='center'
                    size='sm'
                    w='full'
                  >
                    <RadioCard.Label fontSize='sm' fontWeight='medium' mb={1.5}>
                      Type
                    </RadioCard.Label>
                    <SimpleGrid columns={3} gap={2}>
                      {Object.entries(TASK_TYPES).map(([value, meta]) => (
                        <RadioCard.Item key={value} value={value} borderRadius='l2' bg='bg.panel' _checked={{ bg: "brand.subtle" }}>
                          <RadioCard.ItemHiddenInput onBlur={() => setFieldTouched("type")} />
                          <RadioCard.ItemControl py={3} gap={1.5}>
                            <Icon as={meta.icon} boxSize={5} color={`${meta.palette}.fg`} />
                            <RadioCard.ItemText fontWeight='semibold'>{meta.label}</RadioCard.ItemText>
                          </RadioCard.ItemControl>
                        </RadioCard.Item>
                      ))}
                    </SimpleGrid>
                  </RadioCard.Root>
                  <ChakraField.ErrorText>
                    <ErrorMessage name='type' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                  <ChakraField.Root invalid={errors.status && touched.status}>
                    <ChakraField.Label>Status</ChakraField.Label>
                    <NativeSelect.Root>
                      <Field as={NativeSelect.Field} name='status'>
                        <option value=''>Select a task status</option>
                        {BOARD_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {getTaskStatus(status).label}
                          </option>
                        ))}
                      </Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <ChakraField.ErrorText>
                      <ErrorMessage name='status' />
                    </ChakraField.ErrorText>
                  </ChakraField.Root>

                  <AssignTaskField name='assignee' />
                </SimpleGrid>

                <Flex direction={{ base: "column-reverse", sm: "row" }} justify='flex-end' gap={2} pt={2}>
                  <Button variant='outline' colorPalette='gray' onClick={goBack}>
                    Cancel
                  </Button>
                  <Button type='submit' loading={isSubmitting}>
                    {!id ? "Create Task" : "Update Task"}
                  </Button>
                </Flex>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default CreateTask;
