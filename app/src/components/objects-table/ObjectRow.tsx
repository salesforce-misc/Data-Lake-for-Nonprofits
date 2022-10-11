import React from "react";
import isEmpty from "lodash/isEmpty";
import { Badge, Box, Button, Flex, Icon, Tr, Td, keyframes, Alert, AlertTitle, AlertDescription, CloseButton } from "@chakra-ui/react";
import { BsCircle, BsCheckCircleFill } from "react-icons/bs";
import { observer } from "mobx-react";
import { SpinnerIcon } from "@chakra-ui/icons";

import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";
import { FieldsTable } from "components/fields-table/FieldsTable";
import { ISFObject } from "models/helpers/SFObject";

interface IObjectRow {
  object: ISFObject;
  isProcessing: boolean;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ObjectRow = observer(({ object, isProcessing, setProcessing }: IObjectRow) => {
  const { tone, colorScheme } = useColorScheme();
  const { store } = useMetadataStore();
  const [isLoadingFields, setLoadingField] = React.useState(false);
  const [showFields, setShowFields] = React.useState(false);
  const [error, setError] = React.useState("");
  const hasError = !isEmpty(error);

  const onToggleFields = async () => {
    setShowFields((previous) => !previous);
  };

  const onAddOrRemove = async () => {
    if (isProcessing || showFields) return;

    setError("");
    const isSelected = object.selected;

    if (isSelected) {
      object.setSelected(false);
      return;
    }

    if (object.fieldsLoaded) {
      object.setSelected(true);
      return;
    }

    setProcessing(true);
    setLoadingField(true);

    try {
      await store.selectObject(object);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setProcessing(false);
      setLoadingField(false);
    }
  };

  let props: any = {
    color: isProcessing && !isLoadingFields ? tone(100) : tone(500),
    fontSize: "large",
    mt: 1,
    ml: 3,
    mr: 0,
  };

  const frames = keyframes`to { transform: rotate(360deg); }`;

  if (isLoadingFields) {
    props = { ...props, color: tone(500), as: SpinnerIcon, animation: `${frames} 1s linear infinite` };
  } else if (object.selected) {
    props = { ...props, as: BsCheckCircleFill };
  } else {
    props = { ...props, as: BsCircle };
  }

  const fontColor = isProcessing && !isLoadingFields ? tone(100) : tone(500);

  return (
    <>
      <Tr cursor={isProcessing || showFields ? "default" : "pointer"}>
        <Td colSpan={1}>
          <Flex>
            <Icon {...props} onClick={onAddOrRemove} />
            <Box flex={1} ml={4} color={fontColor} onClick={onAddOrRemove}>
              <Box fontWeight={object.selected ? "semibold" : "normal"}>
                {object.label}
                {object.isDefault && (
                  <Badge
                    colorScheme={colorScheme}
                    borderRadius="md"
                    bg={isProcessing && !isLoadingFields ? tone(50) : tone(75)}
                    color={fontColor}
                    p={0}
                    pl={1}
                    pr={1}
                    mt={0}
                    ml={2}
                    fontSize="0.50rem"
                    fontWeight="normal"
                  >
                    npsp
                  </Badge>
                )}
              </Box>
              <Box fontSize="0.6rem">{object.name}</Box>
            </Box>
          </Flex>
        </Td>
        <Td isNumeric>{object.selected && <>{niceNumber(object.selectedFieldsCount)}</>}</Td>
        <Td textAlign="right">
          {object.selected && !hasError && (
            <Button size="xs" fontSize="0.6rem" variant="outline" colorScheme={colorScheme} isDisabled={isProcessing} onClick={onToggleFields} mt={1}>
              {!showFields && <>Customize Fields</>}
              {showFields && <>Collapse Fields Table</>}
            </Button>
          )}
        </Td>
      </Tr>
      {hasError && (
        <Tr>
          <Td colSpan={3}>
            <Alert status="error" variant="left-accent" mt={0} mb={10} color="red.700" alignItems="flex-start" fontSize="sm">
              <Box flex="1">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription display="block">{error}</AlertDescription>
              </Box>
              <CloseButton position="absolute" right="8px" top="8px" onClick={() => setError("")} />
            </Alert>
          </Td>
        </Tr>
      )}
      {showFields && (
        <Tr>
          <Td colSpan={3} pb={12} pt={6}>
            <FieldsTable object={object} />
          </Td>
        </Tr>
      )}
    </>
  );
});
