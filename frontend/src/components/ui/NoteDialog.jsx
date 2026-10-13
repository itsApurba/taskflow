import { Button, Dialog, Field, Flex, Icon, Portal, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";

// Asks for a short note before an action: a worker's note when submitting
// work, a manager's reason when sending it back. Bottom sheet on phones.
const NoteDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  label = "Note",
  placeholder,
  required = false,
  confirmLabel = "Send",
  palette = "brand",
  icon,
  loading = false,
  maxLength = 500,
}) => {
  const [note, setNote] = useState("");
  const [touched, setTouched] = useState(false);
  const missing = required && !note.trim();

  const close = () => {
    setNote("");
    setTouched(false);
    onClose();
  };
  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!missing) onConfirm(note.trim());
  };

  return (
    <Dialog.Root size='sm' placement={{ base: "bottom", sm: "center" }} open={open} onOpenChange={(e) => !e.open && close()} onExitComplete={() => setNote("")}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content asChild>
            <form onSubmit={submit} noValidate>
              <Dialog.Header pb={2}>
                <Flex direction='column' gap={3}>
                  {icon && (
                    <Flex colorPalette={palette} boxSize={11} rounded='full' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center'>
                      <Icon as={icon} boxSize={5} />
                    </Flex>
                  )}
                  <Dialog.Title fontSize='xl' fontWeight='800'>
                    {title}
                  </Dialog.Title>
                </Flex>
              </Dialog.Header>
              <Dialog.Body>
                {description && (
                  <Text color='fg.muted' mb={4}>
                    {description}
                  </Text>
                )}
                <Field.Root invalid={touched && missing} required={required}>
                  <Field.Label w='full'>
                    {label}
                    {!required && (
                      <Text as='span' color='fg.subtle' fontWeight='normal'>
                        (optional)
                      </Text>
                    )}
                    <Text as='span' ms='auto' fontSize='xs' color='fg.subtle' fontVariantNumeric='tabular-nums' aria-hidden>
                      {note.length}/{maxLength}
                    </Text>
                  </Field.Label>
                  <Textarea
                    name='note'
                    rows={4}
                    autoresize
                    maxLength={maxLength}
                    placeholder={placeholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={() => setTouched(true)}
                  />
                  <Field.ErrorText>Add a note so they know what to change.</Field.ErrorText>
                </Field.Root>
              </Dialog.Body>
              <Dialog.Footer flexDirection={{ base: "column-reverse", sm: "row" }} alignItems='stretch' pb={6}>
                <Button variant='outline' colorPalette='gray' onClick={close}>
                  Cancel
                </Button>
                <Button type='submit' colorPalette={palette} loading={loading}>
                  {confirmLabel}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default NoteDialog;
