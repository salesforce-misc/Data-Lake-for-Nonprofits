import React, { Dispatch, FC, useState } from "react";
import isEmpty from "lodash/isEmpty";
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Icon,
  InputGroup,
  InputRightElement,
  Radio,
  RadioGroup,
  Table,
  Tbody,
  Text,
  Thead,
  Th,
  Tr,
  Td,
  keyframes,
  Alert,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { BsCircle, BsCheckCircleFill } from "react-icons/bs";
import { observer } from "mobx-react";
import { SmallCloseIcon, SpinnerIcon } from "@chakra-ui/icons";

import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";
import { ObjectsViewOptions, useObjectsTable } from "models/useObjectsTable";
import { PaginationButtons } from "components/PaginationButtons";
import { FieldsTable } from "components/FieldsTable";
import { ISFObject } from "models/helpers/SFObject";

export const ObjectsTable: FC = observer(() => {
  const { store } = useMetadataStore();
  if (store.empty) return null;

  return (
    <Box mt={6} p={0} mb={6}>
      <ObjectsPanel />
    </Box>
  );
});

const ObjectsPanel: FC = observer(() => {
  const { tone, colorScheme } = useColorScheme();
  const { store } = useMetadataStore();
  const [isProcessing, setProcessing] = useState(false);
  const { objects, viewOption, setViewOption, totalPages, currentPage, setCurrentPage, searchText, setSearchText, totalMatches } = useObjectsTable({
    store,
    pageSize: 25,
  });
  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setSearchText(event.target.value);

  return (
    <Box mt={6} mb={4}>
      <ObjectsViewOptionsPanel viewOption={viewOption} setViewOption={setViewOption} isProcessing={isProcessing} />
      {(totalPages > 1 || !isEmpty(searchText)) && (
        <Box position="relative" mb={8}>
          <Flex mb={0}>
            <InputGroup size="sm">
              <Input type="text" placeholder="Search" borderRadius="md" value={searchText} onChange={handleTextChange} isDisabled={isProcessing} />
              <InputRightElement>
                <IconButton
                  onClick={() => setSearchText("")}
                  size="sm"
                  variant="ghost"
                  color="purple.200"
                  colorScheme={colorScheme}
                  aria-label="Clear search text"
                  _active={{ bg: "none", color: tone(900) }}
                  _hover={{ bg: "none", color: tone(500) }}
                  _focus={{ boxShadow: "none" }}
                  icon={<SmallCloseIcon fontSize="lg" />}
                  isDisabled={isProcessing}
                />
              </InputRightElement>
            </InputGroup>
            <PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} isProcessing={isProcessing} />
          </Flex>
          <Box p={0} m={0} fontSize="0.6rem" position="absolute" bottom="-20px" left="10px">
            {!isEmpty(searchText) && (
              <>
                Found <b>{totalMatches}</b> matches
              </>
            )}
          </Box>
        </Box>
      )}

      <EmptyMessage objects={objects} viewOption={viewOption} searchText={searchText} />

      {objects.length > 0 && (
        <>
          <Table variant="simple" colorScheme={colorScheme} size="sm" mb={6}>
            <Thead>
              <Tr>
                <Th pl={10}>Objects</Th>
                <Th w="100px" textAlign="right">
                  Fields
                </Th>
                <Th w="170px" isNumeric />
              </Tr>
            </Thead>
            <Tbody>
              {objects.map((object) => (
                <ObjectRow key={object.name} object={object} isProcessing={isProcessing} setProcessing={setProcessing} />
              ))}
            </Tbody>
          </Table>
          <Flex mb={0} direction="row-reverse">
            <PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} isProcessing={isProcessing} />
          </Flex>
        </>
      )}
    </Box>
  );
});

const ObjectRow: FC<{ object: ISFObject; isProcessing: boolean; setProcessing: Dispatch<React.SetStateAction<boolean>> }> = observer(
  ({ object, isProcessing, setProcessing }) => {
    const { tone, colorScheme } = useColorScheme();
    const { store } = useMetadataStore();
    const [isLoadingFields, setLoadingField] = useState(false);
    const [limitReached, setLimitReached] = useState(false);
    const [showFields, setShowFields] = useState(false);
    const [error, setError] = useState("");
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

      // Did we reach the limit?
      if (store.selectedObjects.length >= store.maxLimit) {
        setLimitReached(true);
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
            {object.selected && !hasError && !limitReached && (
              <Button
                size="xs"
                fontSize="0.6rem"
                variant="outline"
                colorScheme={colorScheme}
                isDisabled={isProcessing}
                onClick={onToggleFields}
                mt={1}
              >
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
        {limitReached && (
          <Tr>
            <Td colSpan={3} pb={8} color="orange.700">
              <Alert status="warning" borderRadius="md">
                <Box w="full">
                  <AlertTitle>Limit reached</AlertTitle>
                  <AlertDescription fontSize="sm" display="block" mt={2}>
                    You can include up to {store.maxLimit} objects. You have reached this limit, you can exclude an existing object before you can add
                    another one.
                  </AlertDescription>
                  <Box textAlign="right" mt={3}>
                    <Button colorScheme="orange" size="sm" onClick={() => setLimitReached(false)}>
                      Ok
                    </Button>
                  </Box>
                </Box>
              </Alert>
            </Td>
          </Tr>
        )}
      </>
    );
  }
);

const ObjectsViewOptionsPanel: FC<{ viewOption: ObjectsViewOptions; isProcessing: boolean; setViewOption: (option: ObjectsViewOptions) => void }> =
  observer(({ viewOption, setViewOption, isProcessing }) => {
    const { tone, colorScheme } = useColorScheme();
    const { store } = useMetadataStore();
    const cursor = isProcessing ? "not-allowed" : "pointer";
    const is = (option: ObjectsViewOptions) => option === viewOption;
    const changeOption = (option: ObjectsViewOptions) => {
      if (isProcessing) return;
      setViewOption(option);
    };

    return (
      <RadioGroup defaultValue="1" mb={6} cursor={cursor}>
        <Flex fontSize="sm" justifyContent="space-between" pr={2} cursor={cursor}>
          <Flex pl={1} cursor={cursor}>
            <Text color={isProcessing ? tone(300) : tone(800)}>Show</Text>
            <Radio
              ml={6}
              value="1"
              colorScheme={colorScheme}
              isChecked={is(ObjectsViewOptions.All)}
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
          </Flex>
          <Radio
            value="2"
            colorScheme={colorScheme}
            isChecked={is(ObjectsViewOptions.Only_Included)}
            onChange={() => changeOption(ObjectsViewOptions.Only_Included)}
            isDisabled={isProcessing}
            cursor={cursor}
          >
            <Text color={tone(700)} fontSize="sm" mr={4} cursor={cursor}>
              Included Objects
              <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
                {store.selectedObjects.length}
              </Badge>
            </Text>
          </Radio>
          <Radio
            value="3"
            colorScheme={colorScheme}
            isChecked={is(ObjectsViewOptions.Only_Excluded)}
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

const EmptyMessage: FC<{ viewOption: ObjectsViewOptions; objects: ISFObject[]; searchText: string }> = observer(
  ({ viewOption, objects, searchText }) => {
    const { tone } = useColorScheme();
    if (objects.length > 0) return null;
    let content = "No objects are found";

    if (!isEmpty(searchText)) content = "No matches are found";
    else {
      switch (viewOption) {
        case ObjectsViewOptions.All:
          content = "No objects are found";
          break;
        case ObjectsViewOptions.Only_Included:
          content = "No included objects are found";
          break;
        case ObjectsViewOptions.Only_Excluded:
          content = "No excluded objects are found";
      }
    }

    return (
      <Box bg={tone(100)} textAlign="center" p={4} fontSize="xs" color={tone(600)} borderRadius="md">
        {content}
      </Box>
    );
  }
);
