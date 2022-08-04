import React from "react";
import { observer } from "mobx-react";
import { Box, Button, HStack, Tooltip, useClipboard } from "@chakra-ui/react";
import { CheckCircleIcon, CopyIcon } from "@chakra-ui/icons";
import isEmpty from "lodash/isEmpty";

import { useColorScheme } from "models/useColorScheme";

interface IClipboardField {
  value: string;
  isPassword?: boolean;
  canCopy?: boolean;
}

export const ClipboardField = observer(({ value, isPassword = false, canCopy = true }: IClipboardField) => {
  const [show, setShow] = React.useState(false);
  const handleShowClick = () => setShow((previous) => !previous);
  const { tone, colorScheme } = useColorScheme();
  const { hasCopied, onCopy } = useClipboard(value, 500);
  const display = isPassword && !show ? "**************************************" : value;

  return (
    <HStack color={tone(700)}>
      <Box p={0.3} pl={0} pr={2} display="inline-block">
        {display}
      </Box>

      {canCopy && (
        <Tooltip label={hasCopied ? "Copied" : "Copy"}>
          {hasCopied ? <CheckCircleIcon data-testid="check-icon" /> : <CopyIcon cursor="pointer" onClick={onCopy} data-testid="copy-icon" />}
        </Tooltip>
      )}

      {isPassword && (
        <Button
          size="xs"
          onClick={handleShowClick}
          colorScheme={colorScheme}
          variant="outline"
          _focus={{ boxShadow: "none" }}
          isDisabled={isEmpty(value)}
        >
          {show ? "Hide" : "Show"}
        </Button>
      )}
    </HStack>
  );
});
