import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, FormControl, FormLabel, Input, FormErrorMessage, VStack } from "@chakra-ui/react";
import api from "../api/api";

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
});
const SignupForm = () => {
  return (
    <Formik
      initialValues={{ name: "", email: "", password: "" }}
      validationSchema={SignUpSchema}
      onSubmit={async (values) => {
        const res = await api.post("/auth/register", values);
        console.log(res.data);
        const { token } = res.data;
        localStorage.setItem("access_token", JSON.stringify(token));
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
              Sign Up
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};

export default SignupForm;
