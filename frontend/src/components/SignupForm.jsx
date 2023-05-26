import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Box, Button, FormLabel, FormInput, FormErrorMessage, VStack } from "@chakra-ui/react";

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8).required("Required"),
});

const SignupForm = () => {
  return (
    <Formik
      initialValues={{ name: "", email: "", password: "" }}
      validationSchema={SignUpSchema}
      onSubmit={(values) => {
        // Handle form submission and create a new user
        console.log(values);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <VStack spacing={4}>
            <FormLabel>Name</FormLabel>
            <Field type='text' name='name' />
            <FormLabel>Email</FormLabel>
            <Field type='email' name='email' />
            <FormLabel>Password</FormLabel>
            <Field type='password' name='password' />
            <Button type='submit' disabled={isSubmitting}>
              Sign Up
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default SignupForm;
