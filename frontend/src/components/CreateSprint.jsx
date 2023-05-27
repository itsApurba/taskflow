import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, VStack, useColorModeValue } from '@chakra-ui/react'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react'
import * as Yup from "yup";
import api from '../api/api';

const SprintSchema = Yup.object().shape({
//   name: Yup.string().required("Required"),
//   startDate: Yup.date().default(Date.now),
//   endDate: Yup.date().required("Required"),
//   tasks: Yup.array()
//     .of(
//       Yup.object({
//         type: Yup.string().oneOf(["bug", "feature", "story"]).required("Required"),
//         _id: Yup.mongoose.Types.ObjectId.required("Required"),
//       })
//     )
//     .min(1, "At least 1 task is required"),
});

const CreateSprint = () => {
  return (
   <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
    <Formik
      initialValues={{
        name: '',
        startDate: new Date(),
        endDate: new Date(),
        tasks: [],
      }}
      validationSchema={SprintSchema}
      onSubmit={async(values,{resetForm}) => {
        await api.post('/sprints', values);
        // resetForm();
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form>
          <VStack spacing={4}>
            <FormControl isInvalid={errors.name && touched.name}>
              <FormLabel>Name</FormLabel>
              <Field as={Input} type="text" name="name" />
              <FormErrorMessage component="div">
                <ErrorMessage name="name" />
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.startDate && touched.startDate}>
              <FormLabel>Start Date</FormLabel>
              <Field as={Input} type="date" name="startDate" />
              <FormErrorMessage component="div">
                <ErrorMessage name="startDate" />
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.endDate && touched.endDate}>
              <FormLabel>End Date</FormLabel>
              <Field as={Input} type="date" name="endDate" />
              <FormErrorMessage component="div">
                <ErrorMessage name="endDate" />
              </FormErrorMessage>
            </FormControl>

            <Button type="submit" disabled={isSubmitting}>
              Create Sprint
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
   </Box>
  )
}

export default CreateSprint