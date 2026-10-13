import { Button, CloseButton, Dialog, Field as ChakraField, Flex, Input, Portal, Stack, Switch, Text, Textarea } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import api from "../api/api";
import CoinIcon from "./ui/CoinIcon";
import { toaster } from "./ui/toaster";
import { apiErrorMessage } from "../lib/store";

// Empty inputs read as "not set" instead of failing as NaN.
const wholeNumber = () =>
  Yup.number()
    .transform((value, original) => (original === "" || original === null ? undefined : value))
    .typeError("Enter a number");

const RewardSchema = Yup.object().shape({
  title: Yup.string().trim().required("Give the reward a name").max(100, "Max 100 characters"),
  description: Yup.string().max(300, "Max 300 characters"),
  cost: wholeNumber().required("Set a price").integer("Whole credits only").min(1, "At least 1 credit"),
  limited: Yup.boolean(),
  stock: wholeNumber()
    .integer("Whole units only")
    .min(0, "Can't be negative")
    .when("limited", { is: true, then: (schema) => schema.required("How many are available?") }),
  active: Yup.boolean(),
});

const toValues = (reward) => ({
  title: reward?.title ?? "",
  description: reward?.description ?? "",
  cost: reward?.cost ?? "",
  limited: reward ? reward.stock !== null && reward.stock !== undefined : false,
  stock: reward?.stock ?? "",
  active: reward?.active ?? true,
});

const toBody = (values) => ({
  title: values.title.trim(),
  description: values.description.trim(),
  cost: Number(values.cost),
  stock: values.limited ? Number(values.stock) : null,
  active: values.active,
});

const SwitchRow = ({ label, hint, checked, onChange }) => (
  <Switch.Root checked={checked} onCheckedChange={(e) => onChange(e.checked)} colorPalette='brand' w='full' justifyContent='space-between' gap={4}>
    <Switch.HiddenInput />
    <Switch.Label flex='1'>
      <Text fontWeight='semibold'>{label}</Text>
      <Text fontSize='sm' color='fg.muted' fontWeight='normal'>
        {hint}
      </Text>
    </Switch.Label>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
  </Switch.Root>
);

// Create or edit a store item (managers). Pass `reward` to edit it.
const RewardFormDialog = ({ open, onClose, reward }) => {
  const queryClient = useQueryClient();
  const editing = Boolean(reward);
  const save = useMutation({
    mutationFn: (body) => (editing ? api.patch(`/rewards/${reward._id}`, body) : api.post("/rewards", body)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rewards"] }),
  });

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
              initialValues={toValues(reward)}
              validationSchema={RewardSchema}
              onSubmit={async (values) => {
                const body = toBody(values);
                const original = editing ? toBody(toValues(reward)) : {};
                const changes = Object.fromEntries(Object.entries(body).filter(([key, value]) => !editing || value !== original[key]));
                try {
                  await save.mutateAsync(changes);
                  toaster.create({
                    title: editing ? "Reward updated" : "Reward added",
                    description: editing ? undefined : body.active ? "It's live in the store." : "It's hidden until you show it.",
                    type: "success",
                  });
                  onClose();
                } catch (error) {
                  toaster.create({ title: "Couldn't save the reward", description: apiErrorMessage(error), type: "error" });
                }
              }}
            >
              {({ errors, touched, values, setFieldValue, isSubmitting }) => (
                <Form noValidate style={{ display: "contents" }}>
                  <Dialog.Header>
                    <Dialog.Title fontSize='xl' fontWeight='800'>
                      {editing ? "Edit reward" : "New reward"}
                    </Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <Stack gap={5}>
                      <ChakraField.Root invalid={Boolean(errors.title && touched.title)}>
                        <ChakraField.Label>Name</ChakraField.Label>
                        <Field as={Input} name='title' placeholder='e.g. Skip a boring festival' autoComplete='off' />
                        <ChakraField.ErrorText>
                          <ErrorMessage name='title' />
                        </ChakraField.ErrorText>
                      </ChakraField.Root>

                      <ChakraField.Root invalid={Boolean(errors.description && touched.description)}>
                        <ChakraField.Label>
                          Description{" "}
                          <Text as='span' color='fg.subtle' fontWeight='normal'>
                            (optional)
                          </Text>
                        </ChakraField.Label>
                        <Field as={Textarea} name='description' rows={2} autoresize placeholder='What does the winner get?' />
                        <ChakraField.ErrorText>
                          <ErrorMessage name='description' />
                        </ChakraField.ErrorText>
                      </ChakraField.Root>

                      <ChakraField.Root invalid={Boolean(errors.cost && touched.cost)}>
                        <ChakraField.Label>Price</ChakraField.Label>
                        <Flex position='relative' w='full' align='center'>
                          <CoinIcon position='absolute' left={3} boxSize={5} zIndex={1} pointerEvents='none' />
                          <Field as={Input} name='cost' type='number' inputMode='numeric' min={1} step={1} ps={10} placeholder='250' />
                        </Flex>
                        <ChakraField.ErrorText>
                          <ErrorMessage name='cost' />
                        </ChakraField.ErrorText>
                      </ChakraField.Root>

                      <Stack gap={4} bg='bg.subtle' rounded='l2' p={4}>
                        <SwitchRow
                          label='Limited stock'
                          hint={values.limited ? "Each redemption uses one unit." : "Unlimited: anyone can redeem it any time."}
                          checked={values.limited}
                          onChange={(checked) => setFieldValue("limited", checked)}
                        />
                        {values.limited && (
                          <ChakraField.Root invalid={Boolean(errors.stock && touched.stock)}>
                            <ChakraField.Label>Units in stock</ChakraField.Label>
                            <Field as={Input} name='stock' type='number' inputMode='numeric' min={0} step={1} placeholder='5' bg='bg.panel' />
                            <ChakraField.ErrorText>
                              <ErrorMessage name='stock' />
                            </ChakraField.ErrorText>
                          </ChakraField.Root>
                        )}
                        <SwitchRow
                          label='Show in the store'
                          hint='Hidden rewards stay here but workers cannot see them.'
                          checked={values.active}
                          onChange={(checked) => setFieldValue("active", checked)}
                        />
                      </Stack>
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer flexDirection={{ base: "column-reverse", sm: "row" }} alignItems='stretch' pb={6}>
                    <Button variant='outline' colorPalette='gray' onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type='submit' loading={isSubmitting}>
                      {editing ? "Save changes" : "Add reward"}
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

export default RewardFormDialog;
