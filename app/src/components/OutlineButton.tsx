import { FC } from "react";
import { Button, ButtonProps, useTheme } from "@chakra-ui/react";

interface OutlineButtonProps extends ButtonProps {
  selected?: boolean;
}

/**
 * A Button with an outline that uses the color ranges that we need
 */
export const OutlineButton: FC<OutlineButtonProps> = ({ selected = false, ...props }) => {
  const theme = useTheme();
  const outline = theme.outlineButton;

  const allProps: OutlineButtonProps = {
    colorScheme: outline.scheme,
    size: "md",
    variant: "outline",
    _hover: outline.hover,
    _active: outline.active,
    _focus: { boxShadow: "none" },
    ...props,
  };

  if (selected) {
    allProps.bg = outline.selected.bg;
    allProps.color = outline.selected.color;
  }

  return <Button {...allProps} />;
};
