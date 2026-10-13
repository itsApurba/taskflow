import { Box, Button, Field as ChakraField, Input, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../hooks/useColorMode";
import { toaster } from "./ui/toaster";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import api from "../api/api";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AssignSprintField from "./AssignSprintField";
import ShowTasks from "./ShowTasks";

const SprintSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  startDate: Yup.date().default(Date.now),
  endDate: Yup.date().required("Required"),
  tasks: Yup.array(),
});

const CreateSprint = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const initValue = {
    name: state?.sprint.name || "",
    startDate: (state && moment(state.sprint.startDate).format("yyyy-mm-DD")) || new Date(),
    endDate: (state && moment(state.sprint.endDate).format("yyyy-mm-DD")) || new Date(),
    tasks: state?.sprint.tasks || [],
  };

  const navigate = useNavigate();

  return (
    <Box p={4} maxW={"5xl"} m={"auto"}>
      <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
        <Formik
          initialValues={initValue}
          validationSchema={SprintSchema}
          onSubmit={async (values) => {
            console.log(values.startDate);
            const startDate = moment(values.startDate).format();
            const endDate = moment(values.endDate).format();
            console.log(values);
            const updatedValues = {
              name: values.name,
              startDate,
              endDate,
              tasks: values.tasks,
            };
            if (id) {
              try {
                const res = await api.patch(`/sprints/${id}`, updatedValues);
                toaster.create({
                  title: "Update Success",
                  description: res.data.message,
                  type: "success",
                });
                navigate(-1);
              } catch (error) {
                console.log(error);
                toaster.create({
                  title: "Error",
                  description: error.message,
                  type: "error",
                });
              }
            } else {
              try {
                const res = await api.post("/sprints", updatedValues);
                toaster.create({
                  title: "Success",
                  description: res.data.message,
                  type: "success",
                });
              } catch (error) {
                console.log(error);
                toaster.create({
                  title: "Error",
                  description: error.message,
                  type: "error",
                });
              }
            }

            console.log(updatedValues);
            // resetForm();
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <VStack gap={4}>
                <ChakraField.Root invalid={errors.name && touched.name}>
                  <ChakraField.Label>Name</ChakraField.Label>
                  <Field as={Input} type='text' name='name' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='name' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <AssignSprintField name='tasks' />

                <ChakraField.Root invalid={errors.startDate && touched.startDate}>
                  <ChakraField.Label>Start Date</ChakraField.Label>
                  <Field as={Input} type='date' name='startDate' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='startDate' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                <ChakraField.Root invalid={errors.endDate && touched.endDate}>
                  <ChakraField.Label>End Date</ChakraField.Label>
                  <Field as={Input} type='date' name='endDate' />
                  <ChakraField.ErrorText>
                    <ErrorMessage name='endDate' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>

                {/* <FormControl isInvalid={errors.tasks && touched.tasks}>
                  <FormLabel>Tasks</FormLabel>
                  <InputGroup>
                    <Field as={Input} type='text' name='tasks' />
                    <FormErrorMessage component='div'>
                      <ErrorMessage name='tasks' />
                    </FormErrorMessage>
                  </InputGroup>
                </FormControl> */}

                <Button type='submit' disabled={isSubmitting}>
                  {!id ? "Create Sprint" : "Update Sprint"}
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
      {(id && state.sprint.tasks) && state.sprint.tasks.map((task) => <ShowTasks key={task} task={task} />)}
    </Box>
  );
};

export default CreateSprint;
