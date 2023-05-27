import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, FormControl, FormLabel, Input, FormErrorMessage, VStack } from "@chakra-ui/react";

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
});
const LoginForm = () => {
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={SignUpSchema}
      onSubmit={(values) => {
        // Handle form submission and create a new user
        console.log(values);
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form>
          <VStack spacing={4}>

            <FormControl isInvalid={errors.email && touched.email}>
              <FormLabel>Email</FormLabel>
              <Field as={Input} type='email' name='email' />
              <FormErrorMessage component='div'>
                <ErrorMessage name='email' />
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password && touched.password}>
              <FormLabel>Password</FormLabel>
              <Field as={Input} type='password' name='password' />
              <FormErrorMessage component='div'>
                <ErrorMessage name='password' />
              </FormErrorMessage>
            </FormControl>

            <Button type='submit' disabled={isSubmitting}>
              Login
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm;