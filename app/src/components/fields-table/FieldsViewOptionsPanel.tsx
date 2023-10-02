import React from "react";
import { Text, Badge, Flex, RadioGroup, Radio } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";
import { FieldsViewOptions } from "models/useFieldsTable";
import { ISFObject } from "models/helpers/SFObject";

interface IFieldsViewOptionsPanel {
  object: ISFObject;
  viewOption: FieldsViewOptions;
  setViewOption: (option: FieldsViewOptions) => void;
}

export const FieldsViewOptionsPanel = observer(({ object, viewOption, setViewOption }: IFieldsViewOptionsPanel) => {
  const { tone, colorScheme } = useColorScheme();

  const isSelected = (option: FieldsViewOptions) => option === viewOption;

  return (
    <RadioGroup defaultValue="1" mb={6}>
      <Flex fontSize="sm" justifyContent="space-between" pr={2}>
        <Flex pl={1}>Show</Flex>

        <Radio
          value="1"
          colorScheme={colorScheme}
          isChecked={isSelected(FieldsViewOptions.Only_Included)}
          onChange={() => setViewOption(FieldsViewOptions.Only_Included)}
        >
          <Text color={tone(700)} fontSize="sm" mr={4}>
            Amp Impact Fields
            <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
              {object.selectedFieldsCount}
            </Badge>
          </Text>
        </Radio>

        <Radio
          ml={6}
          value="2"
          colorScheme={colorScheme}
          isChecked={isSelected(FieldsViewOptions.All)}
          onChange={() => setViewOption(FieldsViewOptions.All)}
        >
          <Text color={tone(700)} fontSize="sm" mr={4}>
            All Fields
            <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
              {object.fieldsCount}
            </Badge>
          </Text>
        </Radio>

        <Radio
          value="3"
          colorScheme={colorScheme}
          isChecked={isSelected(FieldsViewOptions.Only_Excluded)}
          onChange={() => setViewOption(FieldsViewOptions.Only_Excluded)}
        >
          <Text fontSize="sm" color={tone(700)}>
            Excluded Fields
            <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
              {object.excludedFieldsCount}
            </Badge>
          </Text>
        </Radio>
      </Flex>
    </RadioGroup>
  );
});
