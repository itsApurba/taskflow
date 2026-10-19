import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import PageHeader from "../components/ui/PageHeader";
import { apiErrorMessage } from "../lib/store";

export default function RestorePage() {
  const queryClient = useQueryClient();
  const access = useQuery({ queryKey: ["demoRestoreAccess"], queryFn: async () => (await api.get("/restore")).data });
  const restore = useMutation({
    mutationFn: async () => (await api.post("/restore", { confirm: true })).data,
    onSuccess: () => queryClient.invalidateQueries(),
  });
  return (
    <>
      <PageHeader eyebrow='Demo tools' title='Restore demo data' description='Start the TaskFlow demo again with its original tasks, credits, rewards and penalties.' />
      <Box layerStyle='panel' maxW='2xl' p={{ base: 5, md: 6 }}>
        <Stack gap={5}>
          <Text>This restores all four documented demo accounts, not just the one you are using. Demo passwords and active sessions are kept. Other accounts and shared sprints are not reset.</Text>
          <Text color='fg.muted'>Opening this page does not change data. Confirm below when you are ready. The hourly check also restores data only if it has changed.</Text>
          {access.isPending ? <Text>Checking access…</Text> : access.isError ? (
            <Text role='alert'>{apiErrorMessage(access.error)}</Text>
          ) : !access.data.canRestore ? (
            <Text>Sign in with rohit@taskflow.demo, asha@taskflow.demo, vikram@taskflow.demo or meera@taskflow.demo to restore the demo.</Text>
          ) : (
            <Button alignSelf='start' colorPalette='brand' loading={restore.isPending} disabled={restore.isPending} onClick={() => restore.mutate()}>
              Restore all demo data
            </Button>
          )}
          {restore.isError && <Text role='alert' color='red.fg'>{apiErrorMessage(restore.error)}</Text>}
          {restore.isSuccess && <Text role='status'>{restore.data.restored ? "Demo data restored. You’re ready to demo!" : "Demo data is already unchanged. Nothing needed restoring."}</Text>}
        </Stack>
      </Box>
    </>
  );
}
