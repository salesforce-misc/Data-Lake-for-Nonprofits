import React from "react";
import { Button, ButtonProps, useTheme } from "@chakra-ui/react";

/**
 * A Button with an outline that uses the color ranges that we need
 */
interface IOutlineButton extends ButtonProps {
  selected?: boolean;
}

export const OutlineButton = ({ selected = false, ...props }: IOutlineButton) => {
  const theme = useTheme();
  const outline = theme.outlineButton;

  const allProps: IOutlineButton = {
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
