import { Avatar } from "@chakra-ui/react";

const palettes = ["brand", "xp", "coin", "green", "orange", "pink", "teal", "blue"];

// Stable colour per name so the same person always looks the same.
const paletteFor = (name = "") => palettes[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % palettes.length];

const UserAvatar = ({ name, size = "sm", ...rest }) => (
  <Avatar.Root size={size} colorPalette={paletteFor(name)} variant='subtle' flexShrink={0} {...rest}>
    <Avatar.Fallback name={name || undefined} fontWeight='bold' />
  </Avatar.Root>
);

export default UserAvatar;
