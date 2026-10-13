import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, Field as ChakraField, Input, NativeSelect, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../hooks/useColorMode";
import { toaster } from "./ui/toaster";
import api from "../api/api";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AssignTaskField from "./AssignTaskField";
import { useQueryClient } from "@tanstack/react-query";

const TaskSchema = Yup.object().shape({
  title: Yup.string().required("Required").min(1, "Min 1").max(50, "Max 50"),
  type: Yup.string().oneOf(["bug", "feature", "story"], "Invalid task type").required("Required"),
  description: Yup.string().default("").min(1, "Min 1").max(500, "Max 500"),
  assignee: Yup.string(),
  status: Yup.string().oneOf(["not started", "in progress", "completed", "closed"]).default("not started"),
});

const CreateTask = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const initValue = {
    title: state?.task.title || "",
    type: state?.task.type || "",
    description: state?.task.description || "",
    assignee: state?.task.assignee || "",
    status: state?.task.status || "not started",
  };

  const queryClient = useQueryClient();

  const navigate = useNavigate()
  return (
    <Box p={{ base: 3, md: 4 }} maxW={"5xl"} m={"auto"}>
      <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={{ base: 5, md: 8 }}>
        <Formik
          initialValues={initValue}
          validationSchema={TaskSchema}
          onSubmit={async (values) => {
            try {
              if (!id) {
                await api.post("/tasks", values);
              } else {
                await api.patch(`/tasks/${id}`, values);
                await queryClient.refetchQueries({ queryKey: ["tasks"] });
                navigate(-1);
              }
              toaster.create({
                title: "Success!",
                type: "success",
              });
              // resetForm();
            } catch {
              toaster.create({
                title: "Something went wrong",
                type: "error",
              });
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <VStack gap={4}>
                <ChakraField.Root invalid={errors.title && touched.title}>
                  <ChakraField.Label>Title</ChakraField.Label>
                  <Field as={Input} type='text' name='title' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='title' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root invalid={errors.description && touched.description}>
                  <ChakraField.Label>Description</ChakraField.Label>
                  <Field as={Input} type='text' name='description' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='description' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <AssignTaskField name='assignee' />

                <ChakraField.Root invalid={errors.type && touched.type}>
                  <ChakraField.Label>Type</ChakraField.Label>
                  <NativeSelect.Root>
                    <Field as={NativeSelect.Field} name='type'>
                      <option value=''>Select a task type</option>
                      <option value='bug'>Bug</option>
                      <option value='feature'>Feature</option>
                      <option value='story'>Story</option>
                    </Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <ChakraField.ErrorText>
                    <ErrorMessage name='type' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root invalid={errors.status && touched.status}>
                  <ChakraField.Label>Status</ChakraField.Label>
                  <NativeSelect.Root>
                    <Field as={NativeSelect.Field} name='status'>
                      <option value=''>Select a task status</option>
                      <option value='not started'>Not Started</option>
                      <option value='in progress'>In Progress</option>
                      <option value='completed'>Completed</option>
                      <option value='closed'>Closed</option>
                    </Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <ChakraField.ErrorText>
                    <ErrorMessage name='status' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <Button type='submit' w={{ base: "full", md: "auto" }} disabled={isSubmitting}>
                  {!id ? "Create Task" : "Update Task"}
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default CreateTask;
