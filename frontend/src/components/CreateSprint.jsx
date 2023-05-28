import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, VStack, useColorModeValue, useToast } from "@chakra-ui/react";
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
  const toast = useToast();
  const initValue = {
    name: state?.sprint.name || "",
    startDate: (state && moment(state.sprint.startDate).format("yyyy-mm-DD")) || new Date(),
    endDate: (state && moment(state.sprint.endDate).format("yyyy-mm-DD")) || new Date(),
    tasks: state?.sprint.tasks || [],
  };

  const navigate = useNavigate();

  return (
    <Box p={4} maxW={"container.lg"} m={"auto"}>
      <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
        <Formik
          initialValues={initValue}
          validationSchema={SprintSchema}
          onSubmit={async (values, { resetForm }) => {
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
                toast({
                  title: "Update Success",
                  description: res.data.message,
                  status: "success",
                });
                navigate(-1);
              } catch (error) {
                console.log(error);
                toast({
                  title: "Error",
                  description: error.message,
                  status: "error",
                });
              }
            } else {
              try {
                const res = await api.post("/sprints", updatedValues);
                toast({
                  title: "Success",
                  description: res.data.message,
                  status: "success",
                });
              } catch (error) {
                console.log(error);
                toast({
                  title: "Error",
                  description: error.message,
                  status: "error",
                });
              }
            }

            console.log(updatedValues);
            // resetForm();
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.name && touched.name}>
                  <FormLabel>Name</FormLabel>
                  <Field as={Input} type='text' name='name' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='name' />
                  </FormErrorMessage>
                </FormControl>

                <AssignSprintField name='tasks' />

                <FormControl isInvalid={errors.startDate && touched.startDate}>
                  <FormLabel>Start Date</FormLabel>
                  <Field as={Input} type='date' name='startDate' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='startDate' />
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.endDate && touched.endDate}>
                  <FormLabel>End Date</FormLabel>
                  <Field as={Input} type='date' name='endDate' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='endDate' />
                  </FormErrorMessage>
                </FormControl>

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
