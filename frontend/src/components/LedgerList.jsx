import { Box, Flex, Icon, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import CreditAmount from "./ui/CreditAmount";
import { getLedgerKind, ledgerTitle } from "../lib/store";

const dayLabel = (date) => {
  const day = moment(date);
  if (day.isSame(moment(), "day")) return "Today";
  if (day.isSame(moment().subtract(1, "day"), "day")) return "Yesterday";
  return day.format(day.isSame(moment(), "year") ? "dddd, D MMMM" : "D MMMM YYYY");
};

// Ledger entries (newest first) grouped under day headings.
const groupByDay = (entries) =>
  entries.reduce((groups, entry) => {
    const label = dayLabel(entry.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
    return groups;
  }, []);

export const LedgerRow = ({ entry }) => {
  const kind = getLedgerKind(entry.kind);
  return (
    <Flex align='center' gap={3} px={3} py={2.5} minH={14} rounded='l2'>
      <Flex
        colorPalette={kind.palette}
        boxSize={10}
        rounded='full'
        bg='colorPalette.subtle'
        color='colorPalette.fg'
        align='center'
        justify='center'
        flexShrink={0}
      >
        <Icon as={kind.icon} boxSize={4.5} />
      </Flex>
      <Box flex='1' minW={0}>
        <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
          {ledgerTitle(entry)}
        </Text>
        <Text fontSize='xs' color='fg.muted' lineClamp={1}>
          {kind.label} · {moment(entry.createdAt).format("h:mm A")}
        </Text>
      </Box>
      <CreditAmount value={entry.amount} signed fontWeight='bold' color={entry.amount > 0 ? "green.fg" : undefined} flexShrink={0} />
    </Flex>
  );
};

// Wallet history in a panel, one block per day.
const LedgerList = ({ entries }) => (
  <Stack gap={4} layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
    {groupByDay(entries).map((group) => (
      <Box key={group.label} as='section' aria-label={group.label}>
        <Text textStyle='eyebrow' color='fg.subtle' px={3} pt={2} pb={1}>
          {group.label}
        </Text>
        <Stack gap={0} css={{ "& > * + *": { borderTopWidth: "1px", borderColor: "border", borderStyle: "dashed" } }}>
          {group.entries.map((entry) => (
            <LedgerRow key={entry._id} entry={entry} />
          ))}
        </Stack>
      </Box>
    ))}
  </Stack>
);

export default LedgerList;
