import { Button, Dialog, Flex, Icon, Portal, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";

// Yes/no confirmation for destructive or important actions. Focus starts on
// the safe (cancel) button. Phones get it near the bottom, within thumb reach.
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  palette = "red",
  icon = LuTriangleAlert,
  loading = false,
}) => {
  const cancelRef = useRef(null);
  return (
    <Dialog.Root
      role='alertdialog'
      size='sm'
      placement={{ base: "bottom", sm: "center" }}
      open={open}
      onOpenChange={(e) => !e.open && onClose()}
      initialFocusEl={() => cancelRef.current}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header pb={2}>
              <Flex direction='column' gap={3}>
                <Flex colorPalette={palette} boxSize={11} rounded='full' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center'>
                  <Icon as={icon} boxSize={5} />
                </Flex>
                <Dialog.Title fontSize='xl' fontWeight='800'>
                  {title}
                </Dialog.Title>
              </Flex>
            </Dialog.Header>
            <Dialog.Body>
              <Text color='fg.muted'>{description}</Text>
            </Dialog.Body>
            <Dialog.Footer flexDirection={{ base: "column-reverse", sm: "row" }} alignItems='stretch' pb={6}>
              <Button ref={cancelRef} variant='outline' colorPalette='gray' onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button colorPalette={palette} loading={loading} onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
