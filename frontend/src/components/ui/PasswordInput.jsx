import { IconButton, Input, InputGroup } from "@chakra-ui/react";
import { useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";

// Password field with a show/hide toggle. Works as a Formik `<Field as={PasswordInput} />`.
const PasswordInput = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup
      startElement={<LuLock />}
      endElementProps={{ pe: 1 }}
      endElement={
        <IconButton
          type='button'
          aria-label={visible ? "Hide password" : "Show password"}
          variant='ghost'
          colorPalette='gray'
          size='sm'
          rounded='l1'
          minW={{ base: 10, md: 8 }}
          h={{ base: 10, md: 8 }}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <LuEyeOff /> : <LuEye />}
        </IconButton>
      }
    >
      <Input type={visible ? "text" : "password"} {...props} />
    </InputGroup>
  );
};

export default PasswordInput;
