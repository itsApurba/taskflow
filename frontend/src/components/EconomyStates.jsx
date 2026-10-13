import { Box, Button, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";
import { LuCloudOff, LuLock, LuRefreshCw, LuStore } from "react-icons/lu";
import { Link } from "react-router-dom";
import EmptyState from "./ui/EmptyState";

// Shared loading, error and "not available" states for the wallet, store,
// redemption and penalty screens.

export const SkeletonRows = ({ count = 4, h = "16" }) => (
  <Stack gap={2} layerStyle='panel' p={{ base: 3, md: 4 }}>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} h={h} rounded='l2' />
    ))}
  </Stack>
);

export const SkeletonCards = ({ count = 3 }) => (
  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 4, md: 5 }}>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} h='72' rounded='l3' />
    ))}
  </SimpleGrid>
);

export const LoadError = ({ what = "this", onRetry }) => (
  <Box layerStyle='panel'>
    <EmptyState icon={LuCloudOff} palette='red' title={`Couldn't load ${what}`} description='Check your connection and try again.'>
      {onRetry && (
        <Button variant='outline' colorPalette='gray' onClick={() => onRetry()}>
          <LuRefreshCw /> Try again
        </Button>
      )}
    </EmptyState>
  </Box>
);

// The backend has no gamification API: GET /me 404s and `profile` is null.
export const GameLocked = () => (
  <Box layerStyle='panel'>
    <EmptyState
      icon={LuLock}
      palette='gray'
      title='Credits are not live yet'
      description='Once your team turns on rewards, your wallet, the store and penalties show up here.'
    >
      <Button asChild variant='outline' colorPalette='gray'>
        <Link to='/'>Back to home</Link>
      </Button>
    </EmptyState>
  </Box>
);

// A worker who reports to no manager has no store, market or penalties.
export const NoManager = () => (
  <Box layerStyle='panel'>
    <EmptyState
      icon={LuStore}
      palette='coin'
      title='Join a team to unlock the store'
      description='The store is stocked by the manager you report to. Ask your manager to add you to their team.'
    />
  </Box>
);
