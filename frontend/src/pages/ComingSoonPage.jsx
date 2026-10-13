import { Badge, Box, Button, Flex, Grid, HStack, Icon, Stack, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuFlame, LuMedal, LuTrophy, LuUser, LuZap } from "react-icons/lu";
import { Link } from "react-router-dom";
import PlayerCard from "../components/PlayerCard";
import PageHeader from "../components/ui/PageHeader";

// Copy for every screen that is not built yet. Later work replaces the route
// in AllRoutes.jsx with the real page and removes `soon` in shell/nav.js.
const FEATURES = {
  leaderboard: {
    icon: LuTrophy,
    palette: "orange",
    title: "Leaderboard",
    description: "See who's on top this week and of all time, ranked by credits earned from approved tasks.",
    perks: [
      { icon: LuMedal, text: "Weekly and all-time rankings" },
      { icon: LuZap, text: "Ties broken by XP" },
      { icon: LuFlame, text: "Streaks on show for everyone" },
    ],
  },
  profile: {
    icon: LuUser,
    palette: "brand",
    title: "Profile",
    description: "Your level, XP, streak and history in one place.",
    perks: [
      { icon: LuZap, text: "Level up as you earn XP" },
      { icon: LuFlame, text: "Keep a streak going with daily approvals" },
      { icon: LuMedal, text: "Track how many tasks you've finished" },
    ],
    preview: <PlayerCard />,
  },
};

// Well-designed placeholder for screens that are on the way.
const ComingSoonPage = ({ feature }) => {
  const f = FEATURES[feature];
  return (
    <>
      <PageHeader eyebrow='Coming soon' title={f.title} description={f.description} />
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: f.preview ? "minmax(0, 1fr) minmax(0, 1fr)" : "minmax(0, 1fr)" }}
        gap={{ base: 5, md: 6 }}
        alignItems='start'
        maxW={f.preview ? undefined : "2xl"}
      >
        <Box layerStyle='panel' p={{ base: 5, md: 7 }} animation='fade-up'>
          <Flex
            colorPalette={f.palette}
            boxSize={14}
            rounded='l3'
            bg='colorPalette.subtle'
            color='colorPalette.fg'
            align='center'
            justify='center'
            mb={5}
            animation='pop'
          >
            <Icon as={f.icon} boxSize={7} />
          </Flex>
          <Badge colorPalette={f.palette} variant='subtle' size='md' mb={3}>
            In the works
          </Badge>
          <Text fontWeight='bold' fontSize='lg' mb={4}>
            What you'll be able to do
          </Text>
          <Stack gap={3} mb={6}>
            {f.perks.map((perk) => (
              <HStack key={perk.text} gap={3} align='flex-start'>
                <Flex boxSize={8} rounded='full' bg='bg.muted' color='fg.muted' align='center' justify='center' flexShrink={0}>
                  <Icon as={perk.icon} boxSize={4} />
                </Flex>
                <Text pt={1}>{perk.text}</Text>
              </HStack>
            ))}
          </Stack>
          <Button asChild variant='outline' colorPalette='gray' w={{ base: "full", sm: "auto" }}>
            <Link to='/'>
              <LuArrowLeft /> Back to home
            </Link>
          </Button>
        </Box>
        {f.preview && (
          <Box layerStyle={feature === "profile" ? undefined : "panel"} p={feature === "profile" ? 0 : { base: 5, md: 7 }} animation='fade-up'>
            {f.previewTitle && (
              <Text textStyle='eyebrow' color='fg.muted' mb={3}>
                {f.previewTitle}
              </Text>
            )}
            {f.preview}
          </Box>
        )}
      </Grid>
    </>
  );
};

export default ComingSoonPage;
