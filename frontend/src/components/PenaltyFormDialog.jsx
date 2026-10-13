import { Button, CloseButton, Dialog, Field as ChakraField, Flex, Input, NativeSelect, Portal, Stack, Text, Textarea } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import api from "../api/api";
import useTeam from "../hooks/useTeam";
import CoinIcon from "./ui/CoinIcon";
import { toaster } from "./ui/toaster";
import { firstName } from "../lib/game";
import { apiErrorMessage } from "../lib/store";

const PenaltySchema = Yup.object().shape({
  worker: Yup.string().required("Pick a team member"),
  reason: Yup.string().trim().required("Say what went wrong").max(200, "Max 200 characters"),
  cost: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Enter a number")
    .required("Set what it costs to clear")
    .integer("Whole credits only")
    .min(1, "At least 1 credit"),
});

// Managers issue a penalty to someone in their team. `workerId` preselects a person.
const PenaltyFormDialog = ({ open, onClose, workerId }) => {
  const queryClient = useQueryClient();
  const team = useTeam({ enabled: open });
  const issue = useMutation({
    mutationFn: (body) => api.post("/penalties", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["penalties"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });
  const members = team.data ?? [];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => !e.open && onClose()}
      placement={{ base: "bottom", sm: "center" }}
      scrollBehavior='inside'
      size='md'
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Formik
              initialValues={{ worker: workerId ?? "", reason: "", cost: "" }}
              validationSchema={PenaltySchema}
              onSubmit={async (values) => {
                try {
                  await issue.mutateAsync({ worker: values.worker, reason: values.reason.trim(), cost: Number(values.cost) });
                  const person = members.find((m) => m._id === values.worker);
                  toaster.create({
                    title: "Penalty issued",
                    description: person ? `${firstName(person.name)} can clear it with credits.` : undefined,
                    type: "success",
                  });
                  onClose();
                } catch (error) {
                  toaster.create({ title: "Couldn't issue the penalty", description: apiErrorMessage(error), type: "error" });
                }
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form noValidate style={{ display: "contents" }}>
                  <Dialog.Header flexDirection='column' alignItems='flex-start' gap={1}>
                    <Dialog.Title fontSize='xl' fontWeight='800'>
                      Issue a penalty
                    </Dialog.Title>
                    <Text color='fg.muted' fontSize='sm'>
                      They pay it off with credits they've earned. Keep the reason specific and fair.
                    </Text>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap={5}>
                      <ChakraField.Root invalid={Boolean(errors.worker && touched.worker)}>
                        <ChakraField.Label>Team member</ChakraField.Label>
                        <NativeSelect.Root disabled={team.isLoading}>
                          <Field as={NativeSelect.Field} name='worker'>
                            <option value=''>{team.isLoading ? "Loading your team…" : members.length ? "Choose someone" : "No one reports to you yet"}</option>
                            {members.map((member) => (
                              <option key={member._id} value={member._id}>
                                {member.name}
                              </option>
                            ))}
                          </Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <ChakraField.ErrorText>
                          <ErrorMessage name='worker' />
                        </ChakraField.ErrorText>
                      </ChakraField.Root>

                      <ChakraField.Root invalid={Boolean(errors.reason && touched.reason)}>
                        <ChakraField.Label>Reason</ChakraField.Label>
                        <Field as={Textarea} name='reason' rows={2} autoresize placeholder='e.g. Missed the sprint demo' />
                        <ChakraField.ErrorText>
                          <ErrorMessage name='reason' />
                        </ChakraField.ErrorText>
                      </ChakraField.Root>

                      <ChakraField.Root invalid={Boolean(errors.cost && touched.cost)}>
                        <ChakraField.Label>Credits to clear it</ChakraField.Label>
                        <Flex position='relative' w='full' align='center'>
                          <CoinIcon position='absolute' left={3} boxSize={5} zIndex={1} pointerEvents='none' />
                          <Field as={Input} name='cost' type='number' inputMode='numeric' min={1} step={1} ps={10} placeholder='40' />
                        </Flex>
                        <ChakraField.HelperText>Credits leave their wallet only when they choose to clear it.</ChakraField.HelperText>
                        <ChakraField.ErrorText>
                          <ErrorMessage name='cost' />
                        </ChakraField.ErrorText>
                      </ChakraField.Root>
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer flexDirection={{ base: "column-reverse", sm: "row" }} alignItems='stretch' pb={6}>
                    <Button variant='outline' colorPalette='gray' onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type='submit' colorPalette='red' loading={isSubmitting}>
                      Issue penalty
                    </Button>
                  </Dialog.Footer>
                </Form>
              )}
            </Formik>
            <Dialog.CloseTrigger asChild>
              <CloseButton size='sm' />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default PenaltyFormDialog;
