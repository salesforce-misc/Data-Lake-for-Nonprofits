import React from "react";
import { Badge, Flex, Radio, RadioGroup, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";
import { ObjectsViewOptions } from "models/useObjectsTable";

interface IObjectsViewOptionsPanel {
  viewOption: ObjectsViewOptions;
  isProcessing: boolean;
  setViewOption: (option: ObjectsViewOptions) => void;
}

export const ObjectsViewOptionsPanel = observer(({ viewOption, setViewOption, isProcessing }: IObjectsViewOptionsPanel) => {
  const { tone, colorScheme } = useColorScheme();
  const { store } = useMetadataStore();

  const cursor = isProcessing ? "not-allowed" : "pointer";

  const isSelected = (option: ObjectsViewOptions): boolean => option === viewOption;

  const changeOption = (option: ObjectsViewOptions) => {
    if (isProcessing) return;

    setViewOption(option);
  };

  return (
    <RadioGroup defaultValue="1" mb={6} cursor={cursor}>
      <Flex fontSize="sm" justifyContent="space-between" pr={2} cursor={cursor}>
        <Flex pl={1} cursor={cursor}>
          <Text color={isProcessing ? tone(300) : tone(800)}>Show</Text>
        </Flex>

        <Radio
          value="1"
          colorScheme={colorScheme}
          isChecked={isSelected(ObjectsViewOptions.Only_Included)}
          onChange={() => changeOption(ObjectsViewOptions.Only_Included)}
          isDisabled={isProcessing}
          cursor={cursor}
        >
          <Text color={tone(700)} fontSize="sm" mr={4} cursor={cursor}>
            NPSP Objects
            <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
              {store.selectedObjects.length}
            </Badge>
          </Text>
        </Radio>

        <Radio
          ml={6}
          value="2"
          colorScheme={colorScheme}
          isChecked={isSelected(ObjectsViewOptions.All)}
          onChange={() => changeOption(ObjectsViewOptions.All)}
          isDisabled={isProcessing}
          cursor={cursor}
        >
          <Text color={tone(700)} fontSize="sm" mr={4} cursor={cursor}>
            All Objects
            <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
              {store.listAll.length}
            </Badge>
          </Text>
        </Radio>

        <Radio
          value="3"
          colorScheme={colorScheme}
          isChecked={isSelected(ObjectsViewOptions.Only_Excluded)}
          onChange={() => changeOption(ObjectsViewOptions.Only_Excluded)}
          isDisabled={isProcessing}
          cursor={cursor}
        >
          <Text fontSize="sm" color={tone(700)} cursor={cursor}>
            Excluded Objects
            <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
              {store.excludedObjects.length}
            </Badge>
          </Text>
        </Radio>
      </Flex>
    </RadioGroup>
  );
});
