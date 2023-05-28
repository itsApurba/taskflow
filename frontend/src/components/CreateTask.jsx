import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, FormControl, FormLabel, Input, FormErrorMessage, Select, VStack, useColorModeValue, useToast } from "@chakra-ui/react";
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
  const toast = useToast();
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
    <Box p={4} maxW={"container.lg"} m={"auto"}>
      <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
        <Formik
          initialValues={initValue}
          validationSchema={TaskSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              if (!id) {
                await api.post("/tasks", values);
              } else {
                await api.patch(`/tasks/${id}`, values);
                await queryClient.refetchQueries(["tasks"]);
                navigate(-1);
              }
              toast({
                title: "Success!",
                status: "success",
                position: "top",
              });
              // resetForm();
            } catch (error) {
              toast({
                title: "Something went wrong",
                status: "error",
                position: "top",
              });
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.title && touched.title}>
                  <FormLabel>Title</FormLabel>
                  <Field as={Input} type='text' name='title' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='title' />
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.description && touched.description}>
                  <FormLabel>Description</FormLabel>
                  <Field as={Input} type='text' name='description' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='description' />
                  </FormErrorMessage>
                </FormControl>

                <AssignTaskField name='assignee' />

                <FormControl isInvalid={errors.type && touched.type}>
                  <FormLabel>Type</FormLabel>
                  <Field as={Select} isInvalid={errors.type && touched.type} name='type'>
                    <option value=''>Select a task type</option>
                    <option value='bug'>Bug</option>
                    <option value='feature'>Feature</option>
                    <option value='story'>Story</option>
                  </Field>
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='type' />
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.status && touched.status}>
                  <FormLabel>Status</FormLabel>
                  <Field as={Select} isInvalid={errors.status && touched.status} name='status'>
                    <option value=''>Select a task status</option>
                    <option value='not started'>Not Started</option>
                    <option value='in progress'>In Progress</option>
                    <option value='completed'>Completed</option>
                    <option value='closed'>Closed</option>
                  </Field>
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='status' />
                  </FormErrorMessage>
                </FormControl>

                <Button type='submit' disabled={isSubmitting}>
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
