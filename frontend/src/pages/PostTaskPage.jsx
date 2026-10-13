import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, Field as ChakraField, Flex, Grid, HStack, Icon, Input, InputGroup, RadioCard, SimpleGrid, Skeleton, Stack, Text, Textarea } from "@chakra-ui/react";
import { LuFileQuestion, LuLock, LuStore } from "react-icons/lu";
import { Link, useNavigate, useParams } from "react-router-dom";
import MarketTaskCard from "../components/MarketTaskCard";
import CoinIcon from "../components/ui/CoinIcon";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import RewardTierBadge from "../components/ui/RewardTierBadge";
import { toaster } from "../components/ui/toaster";
import useGoBack from "../hooks/useGoBack";
import useMe from "../hooks/useMe";
import { errorMessage, useMarketTask, useTaskAction } from "../hooks/useMarket";
import { REWARD_TIERS, TASK_TYPES, formatNumber } from "../lib/game";

const MAX_REWARD = 10000;

const TaskSchema = Yup.object().shape({
  title: Yup.string().trim().required("Give the task a title").max(50, "Keep it under 50 characters"),
  description: Yup.string().max(500, "Keep it under 500 characters"),
  type: Yup.string().oneOf(Object.keys(TASK_TYPES), "Pick a type").required("Pick a type"),
  reward: Yup.number()
    .typeError("Enter a number of credits")
    .required("Set a reward")
    .integer("Whole credits only")
    .min(0, "Can't be negative")
    .max(MAX_REWARD, `At most ${formatNumber(MAX_REWARD)} credits`),
});

// One quick pick per tier, from Common up to Legendary.
const QUICK_REWARDS = [25, 50, 100, 200];

const Counter = ({ value, max }) => (
  <Text as='span' ms='auto' fontSize='xs' fontWeight='medium' color={value.length > max ? "fg.error" : "fg.subtle"} fontVariantNumeric='tabular-nums' aria-hidden>
    {value.length}/{max}
  </Text>
);

const Gate = ({ header, icon, title, description, children }) => (
  <Box maxW='2xl'>
    {header}
    <EmptyState icon={icon} title={title} description={description} layerStyle='panel'>
      {children}
    </EmptyState>
  </Box>
);

// Managers post a task to their team's market with a credit reward, and edit
// it while it is still open.
const PostTaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack(id ? `/market/${id}` : "/market?tab=team");
  const { profile, isLoading: profileLoading } = useMe();
  const existing = useMarketTask(id);
  const create = useTaskAction("create");
  const update = useTaskAction("update");
  const task = existing.data;

  const header = (
    <PageHeader
      back={id ? `/market/${id}` : "/market"}
      eyebrow={id ? "Edit task" : "Post a task"}
      title={id ? "Edit task" : "What needs doing?"}
      description={id ? "Change the details or the reward while nobody has claimed it." : "Your team sees it on the market and can claim it right away."}
    />
  );

  if (profileLoading || (id && existing.isLoading)) {
    return (
      <Box maxW='2xl'>
        {header}
        <Skeleton h='96' rounded='l3' />
      </Box>
    );
  }
  if (profile?.role !== "manager") {
    return (
      <Gate header={<PageHeader back='/market' eyebrow='Task market' title='Post a task' />} icon={LuLock} title='Managers post tasks' description='Workers claim tasks from the market instead. Find one that pays well!'>
        <Button asChild>
          <Link to='/market'>
            <LuStore /> Browse the market
          </Link>
        </Button>
      </Gate>
    );
  }
  if (id && !task) {
    return (
      <Gate header={header} icon={LuFileQuestion} title='Task not found' description='It may have been deleted.'>
        <Button asChild>
          <Link to='/market?tab=team'>Back to your tasks</Link>
        </Button>
      </Gate>
    );
  }
  if (id && task.status !== "open") {
    return (
      <Gate header={header} icon={LuLock} title='This task is already claimed' description='You can only edit a task while it is open on the market.'>
        <Button asChild>
          <Link to={`/market/${id}`}>Open the task</Link>
        </Button>
      </Gate>
    );
  }

  const initialValues = {
    title: task?.title ?? "",
    description: task?.description ?? "",
    type: task?.type ?? "",
    reward: task?.reward ?? "",
  };

  return (
    <>
      {header}
      <Formik
        initialValues={initialValues}
        validationSchema={TaskSchema}
        onSubmit={async (values) => {
          const body = { title: values.title.trim(), description: values.description.trim(), type: values.type, reward: Number(values.reward) };
          try {
            if (id) {
              await update.mutateAsync({ id, ...body });
              toaster.create({ title: "Task updated", type: "success" });
              navigate(`/market/${id}`, { replace: true });
            } else {
              const created = await create.mutateAsync(body);
              toaster.create({
                title: "Posted to the market",
                description: `Your team can claim it now for ${formatNumber(body.reward)} credits.`,
                type: "success",
                action: { label: "View", onClick: () => navigate(`/market/${created._id}`) },
              });
              navigate("/market?tab=team");
            }
          } catch (error) {
            toaster.create({ title: id ? "Couldn't save the task" : "Couldn't post the task", description: errorMessage(error), type: "error" });
          }
        }}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue, setFieldTouched }) => {
          const reward = Number(values.reward) || 0;
          return (
            <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap={{ base: 5, md: 6 }} alignItems='start' maxW={{ base: "2xl", lg: "none" }}>
              <Box layerStyle='panel' p={{ base: 4, md: 7 }} animation='fade-up'>
                <Form noValidate>
                  <Stack gap={5}>
                    <ChakraField.Root invalid={errors.title && touched.title}>
                      <ChakraField.Label w='full'>
                        Title <Counter value={values.title} max={50} />
                      </ChakraField.Label>
                      <Field as={Input} type='text' name='title' placeholder='e.g. Fix the login redirect on Safari' />
                      <ChakraField.ErrorText>
                        <ErrorMessage name='title' />
                      </ChakraField.ErrorText>
                    </ChakraField.Root>

                    <ChakraField.Root invalid={errors.description && touched.description}>
                      <ChakraField.Label w='full'>
                        Description <Counter value={values.description} max={500} />
                      </ChakraField.Label>
                      <Field as={Textarea} name='description' rows={4} autoresize placeholder='What needs doing, and how will you know it is done?' />
                      <ChakraField.ErrorText>
                        <ErrorMessage name='description' />
                      </ChakraField.ErrorText>
                    </ChakraField.Root>

                    <ChakraField.Root invalid={errors.type && touched.type}>
                      <RadioCard.Root
                        name='type'
                        value={values.type || null}
                        onValueChange={(e) => setFieldValue("type", e.value)}
                        orientation='vertical'
                        align='center'
                        size='sm'
                        w='full'
                      >
                        <RadioCard.Label fontSize='sm' fontWeight='medium' mb={1.5}>
                          Type
                        </RadioCard.Label>
                        <SimpleGrid columns={3} gap={2}>
                          {Object.entries(TASK_TYPES).map(([value, meta]) => (
                            <RadioCard.Item key={value} value={value} borderRadius='l2' bg='bg.panel' _checked={{ bg: "brand.subtle" }}>
                              <RadioCard.ItemHiddenInput onBlur={() => setFieldTouched("type")} />
                              <RadioCard.ItemControl py={3} gap={1.5}>
                                <Icon as={meta.icon} boxSize={5} color={`${meta.palette}.fg`} />
                                <RadioCard.ItemText fontWeight='semibold'>{meta.label}</RadioCard.ItemText>
                              </RadioCard.ItemControl>
                            </RadioCard.Item>
                          ))}
                        </SimpleGrid>
                      </RadioCard.Root>
                      <ChakraField.ErrorText>
                        <ErrorMessage name='type' />
                      </ChakraField.ErrorText>
                    </ChakraField.Root>

                    <ChakraField.Root invalid={errors.reward && touched.reward}>
                      <ChakraField.Label w='full'>
                        Reward
                        <Box ms='auto'>
                          <RewardTierBadge reward={reward} showAmount={false} size='sm' />
                        </Box>
                      </ChakraField.Label>
                      <InputGroup startElement={<CoinIcon boxSize={5} />} endElement={<Text color='fg.muted' fontSize='sm'>credits</Text>}>
                        <Field as={Input} type='number' inputMode='numeric' name='reward' min={0} max={MAX_REWARD} step={1} placeholder='100' textStyle='hud' />
                      </InputGroup>
                      <HStack gap={2} mt={2} wrap='wrap'>
                        {QUICK_REWARDS.map((amount) => (
                          <RewardTierBadge
                            key={amount}
                            as='button'
                            type='button'
                            reward={amount}
                            showTier={false}
                            size='lg'
                            cursor='pointer'
                            minH={{ base: 11, md: 8 }}
                            px={3}
                            opacity={reward === amount ? 1 : 0.8}
                            outline={reward === amount ? "2px solid" : undefined}
                            outlineColor='colorPalette.solid'
                            onClick={() => setFieldValue("reward", amount)}
                          />
                        ))}
                      </HStack>
                      <ChakraField.HelperText>Paid to whoever does it, once you approve the work. They earn the same in XP.</ChakraField.HelperText>
                      <ChakraField.ErrorText>
                        <ErrorMessage name='reward' />
                      </ChakraField.ErrorText>
                    </ChakraField.Root>

                    <Flex direction={{ base: "column-reverse", sm: "row" }} justify='flex-end' gap={2} pt={2}>
                      <Button variant='outline' colorPalette='gray' onClick={goBack}>
                        Cancel
                      </Button>
                      <Button type='submit' loading={isSubmitting}>
                        {id ? "Save changes" : "Post to the market"}
                      </Button>
                    </Flex>
                  </Stack>
                </Form>
              </Box>

              <Stack gap={3} display={{ base: "none", lg: "flex" }} position='sticky' top={24}>
                <Text textStyle='eyebrow' color='fg.muted'>
                  On the market
                </Text>
                <MarketTaskCard preview task={{ ...values, reward, created_at: task?.created_at }} posterName={profile.name} />
                <Stack gap={1.5} layerStyle='panel' p={4}>
                  <Text fontSize='sm' fontWeight='semibold'>
                    Reward tiers
                  </Text>
                  {[...REWARD_TIERS].reverse().map((tier, i, tiers) => (
                    <Flex key={tier.id} justify='space-between' align='center' gap={3}>
                      <RewardTierBadge reward={tier.min} showAmount={false} size='sm' />
                      <Text fontSize='xs' color='fg.muted' fontVariantNumeric='tabular-nums'>
                        {tiers[i + 1] ? `${tier.min}–${tiers[i + 1].min - 1}` : `${tier.min}+`} credits
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          );
        }}
      </Formik>
    </>
  );
};

export default PostTaskPage;
