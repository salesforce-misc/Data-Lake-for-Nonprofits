import { FC } from "react";
import { observer } from "mobx-react";
import { HStack, Input, VStack, Text } from "@chakra-ui/react";

export const TimeInput: FC<{ hour: string; minute: string; onChange: ({ hour, minute }: { hour: string; minute: string }) => void }> = observer(
  ({ hour, minute, onChange }) => {
    return (
      <HStack mt={3} alignItems="flex-start">
        <VStack spacing={0}>
          <Input placeholder="hh" size="xs" maxW="40px" value={hour} onChange={(event) => onChange({ hour: event.target.value, minute })} />
          <Text fontSize="xs">hour</Text>
        </VStack>
        <Text>:</Text>
        <VStack spacing={0} alignItems="start">
          <Input placeholder="mm" size="xs" maxW="40px" value={minute} onChange={(event) => onChange({ minute: event.target.value, hour })} />
          <Text fontSize="xs">minute</Text>
        </VStack>
        <Text fontSize="xs" pl={1} pt={1}>
          UTC
        </Text>
      </HStack>
    );
  }
);
