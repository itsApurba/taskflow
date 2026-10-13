import { Box, Card, Flex, HStack, Heading, Icon, Text } from "@chakra-ui/react";
import moment from "moment";
import { Link } from "react-router-dom";
import CreditAmount from "./ui/CreditAmount";
import TaskTypeBadge from "./ui/TaskTypeBadge";
import UserAvatar from "./ui/UserAvatar";
import { getRewardTier, taskPath } from "../lib/game";

// Keeps buttons clickable above the card-wide title link.
const raised = { position: "relative", zIndex: 1 };

// A market listing, shown like an item in a shop: a price tag in the reward's
// tier colour, the title, type and who posted it. `action` (a Claim or Edit
// button) sits in the footer. `preview` renders it without links, for forms.
const MarketTaskCard = ({ task, posterName, action, preview = false, ...rest }) => {
  const tier = getRewardTier(task.reward);
  const posted = task.created_at ? moment(task.created_at).fromNow() : "just now";
  return (
    <Card.Root
      variant='outline'
      position='relative'
      overflow='hidden'
      transition='transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      _hover={preview ? undefined : { transform: "translateY(-2px)", boxShadow: "card-hover", borderColor: `${tier.palette}.muted` }}
      animation='fade-up'
      {...rest}
    >
      {/* Price tag */}
      <Flex colorPalette={tier.palette} bg='colorPalette.subtle' borderBottomWidth='1px' borderColor='colorPalette.muted' px={4} py={3} align='center' justify='space-between' gap={3}>
        <HStack gap={2} color='colorPalette.fg' minW={0}>
          <Flex boxSize={7} rounded='full' bg='colorPalette.muted' align='center' justify='center' flexShrink={0}>
            <Icon as={tier.icon} boxSize={3.5} />
          </Flex>
          <Text textStyle='eyebrow' lineClamp={1}>
            {tier.label}
          </Text>
        </HStack>
        <CreditAmount value={task.reward} size='lg' />
      </Flex>

      <Card.Body gap={3} p={4}>
        <Box minW={0}>
          <Heading as='h3' fontSize='lg' fontWeight='700' lineHeight='1.3' overflowWrap='anywhere'>
            {preview ? (
              task.title || "Your task title"
            ) : (
              <Box
                asChild
                // Stretched link: the whole card opens the task.
                _after={{ content: '""', position: "absolute", inset: 0, borderRadius: "l3" }}
                _focusVisible={{ outline: "none", _after: { outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" } }}
              >
                <Link to={taskPath(task)}>{task.title}</Link>
              </Box>
            )}
          </Heading>
          {task.description && (
            <Text color='fg.muted' fontSize='sm' mt={1} lineClamp={2} overflowWrap='anywhere'>
              {task.description}
            </Text>
          )}
        </Box>
        {task.type && (
          <Box>
            <TaskTypeBadge type={task.type} />
          </Box>
        )}
      </Card.Body>

      <Card.Footer px={4} pb={4} pt={0} mt='auto'>
        <Flex w='full' align='center' justify='space-between' gap={3} pt={3} borderTopWidth='1px' borderColor='border'>
          <HStack gap={2} minW={0}>
            <UserAvatar name={posterName ?? ""} size='xs' />
            <Box minW={0} lineHeight='1.2'>
              <Text fontSize='sm' fontWeight='medium' lineClamp={1}>
                {posterName ?? "Your manager"}
              </Text>
              <Text fontSize='xs' color='fg.subtle' lineClamp={1}>
                Posted {posted}
              </Text>
            </Box>
          </HStack>
          {action && (
            <Box flexShrink={0} {...raised}>
              {action}
            </Box>
          )}
        </Flex>
      </Card.Footer>
    </Card.Root>
  );
};

export default MarketTaskCard;
