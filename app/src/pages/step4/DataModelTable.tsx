import { FC, useState } from "react";
import isEmpty from "lodash/isEmpty";
import {
  Box,
  Text,
  HStack,
  Badge,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  SimpleGrid,
  Icon,
  Flex,
  Divider,
  Alert,
  AlertDescription,
  RadioGroup,
  Radio,
  IconButton,
  InputGroup,
  Input,
  InputRightElement,
} from "@chakra-ui/react";
import { ChevronRightIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { BsCircle, BsCheckCircleFill } from "react-icons/bs";
import { observer } from "mobx-react";

import { niceNumber } from "helpers/utils";
import { useMetadataStore } from "models/MetadataStore";
import { useColorScheme } from "models/useColorScheme";
import { FieldsViewOptions, useFieldsTable } from "models/useFieldsTable";
import { ISFObject } from "models/helpers/SFObject";
import { IField } from "models/helpers/Field";
import { PaginationButtons } from "components/PaginationButtons";

export const DataModelTable: FC = observer(() => {
  const { colorScheme } = useColorScheme();
  const { store } = useMetadataStore();
  const selectedObjectsCount = store.selectedObjects.length;
  const isEmptyModel = selectedObjectsCount === 0;
  const selectedFieldsCount = store.selectedFieldsCount;

  return (
    <>
      {!isEmptyModel && (
        <Table variant="simple" mt={4} colorScheme={colorScheme}>
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th isNumeric># Fields</Th>
            </Tr>
          </Thead>
          <Tbody>
            {store.selectedObjects.map((item) => (
              <ObjectRow key={`${item.label}-${item.name}`} object={item} />
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th></Th>
              <Th isNumeric>{niceNumber(selectedFieldsCount)}</Th>
            </Tr>
          </Tfoot>
        </Table>
      )}
    </>
  );
});

const ObjectRow: FC<{ object: ISFObject }> = observer(({ object }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Tr cursor="pointer" onClick={() => setExpanded((previous) => !previous)}>
        <Td>
          <HStack alignItems="flex-start">
            <ChevronRightIcon transition="transform 0.2s" transform={expanded ? "rotate(90deg)" : "rotate(0deg)"} />
            <Box>
              {object.label} &nbsp;
              <Text fontSize="xs" display="inline-block">
                ( {object.name} )
              </Text>
            </Box>
          </HStack>
        </Td>
        <Td isNumeric>{niceNumber(object.selectedFieldsCount)}</Td>
      </Tr>
      {expanded && (
        <Tr>
          <Td colSpan={2} pb={8}>
            <FieldsPanel object={object} />
          </Td>
        </Tr>
      )}
    </>
  );
});

const FieldsPanel: FC<{ object: ISFObject }> = observer(({ object }) => {
  const { tone, colorScheme } = useColorScheme();
  const { fields, viewOption, setViewOption, totalPages, currentPage, setCurrentPage, searchText, setSearchText, totalMatches } = useFieldsTable({
    object,
  });
  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => setSearchText(event.target.value);

  return (
    <Box p={3} borderRadius="md" borderWidth="1px" borderColor={tone(100)}>
      <FieldsViewOptionsPanel object={object} viewOption={viewOption} setViewOption={setViewOption} />
      {(totalPages > 1 || !isEmpty(searchText)) && (
        <Box position="relative" mb={8}>
          <Flex mb={0}>
            <InputGroup size="sm">
              <Input type="text" placeholder="Search" borderRadius="md" value={searchText} onChange={handleTextChange} />
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
                />
              </InputRightElement>
            </InputGroup>
            <PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
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
      <EmptyMessage object={object} fields={fields} viewOption={viewOption} searchText={searchText} />
      <FieldsGrid fields={fields} />
      <ImmutableFieldsGrid object={object} viewOption={viewOption} />
    </Box>
  );
});

const EmptyMessage: FC<{ object: ISFObject; viewOption: FieldsViewOptions; fields: IField[]; searchText: string }> = observer(
  ({ object, viewOption, fields, searchText }) => {
    const { tone } = useColorScheme();
    if (fields.length > 0) return null;
    let content = "No fields are found";
    let size = 0;

    if (!isEmpty(searchText)) content = "No matches are found";
    else {
      switch (viewOption) {
        case FieldsViewOptions.All:
          size = object.immutableFields.length;
          if (size > 0) {
            content = `There are ${size} included fields. They are mandatory.`;
          } else {
            content = "No fields are found";
          }
          break;
        case FieldsViewOptions.Only_Included:
          size = object.immutableFields.length;
          if (size > 0) {
            content = `There are ${size} included fields. They are mandatory.`;
          } else {
            content = "No included fields are found";
          }
          break;
        case FieldsViewOptions.Only_Excluded:
          content = "No excluded fields are found";
      }
    }

    return (
      <Box bg={tone(100)} textAlign="center" p={4} fontSize="xs" color={tone(600)} borderRadius="md">
        {content}
      </Box>
    );
  }
);

const FieldsViewOptionsPanel: FC<{ object: ISFObject; viewOption: FieldsViewOptions; setViewOption: (option: FieldsViewOptions) => void }> = observer(
  ({ object, viewOption, setViewOption }) => {
    const { tone, colorScheme } = useColorScheme();
    const is = (option: FieldsViewOptions) => option === viewOption;

    return (
      <RadioGroup defaultValue="1" mb={6}>
        <Flex fontSize="sm" justifyContent="space-between" pr={2}>
          <Flex pl={1}>
            Show
            <Radio
              ml={6}
              value="1"
              colorScheme={colorScheme}
              isChecked={is(FieldsViewOptions.All)}
              onChange={() => setViewOption(FieldsViewOptions.All)}
            >
              <Text color={tone(700)} fontSize="sm" mr={4}>
                All Fields
                <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
                  {object.fieldsCount}
                </Badge>
              </Text>
            </Radio>
          </Flex>
          <Radio
            value="2"
            colorScheme={colorScheme}
            isChecked={is(FieldsViewOptions.Only_Included)}
            onChange={() => setViewOption(FieldsViewOptions.Only_Included)}
          >
            <Text color={tone(700)} fontSize="sm" mr={4}>
              Included Fields
              <Badge ml={2} bg={tone(75)} fontSize="xs" borderRadius="full" fontWeight="normal">
                {object.selectedFieldsCount}
              </Badge>
            </Text>
          </Radio>
          <Radio
            value="3"
            colorScheme={colorScheme}
            isChecked={is(FieldsViewOptions.Only_Excluded)}
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
  }
);

const FieldsGrid: FC<{ fields: IField[] }> = observer(({ fields }) => {
  if (fields.length < 1) return null;
  return (
    <SimpleGrid minChildWidth="200px" spacing="15px" mt={6}>
      {fields.map((field) => (
        <SelectableField key={field.name} field={field} />
      ))}
    </SimpleGrid>
  );
});

const ImmutableFieldsGrid: FC<{ object: ISFObject; viewOption: FieldsViewOptions }> = observer(({ object, viewOption }) => {
  const { tone, colorScheme } = useColorScheme();
  const immutableFields = object.immutableFields;

  if (viewOption === FieldsViewOptions.Only_Excluded) return null;
  if (immutableFields.length < 1) return null;

  return (
    <Box pt={6}>
      <Divider borderColor={tone(400)} />
      <Alert status="info" colorScheme={colorScheme} bg={tone(50)} mt={4} borderRadius="md" fontSize="small" color={tone(700)}>
        <AlertDescription>
          The following <b>{immutableFields.length}</b> fields can not be excluded. They will always be imported.
        </AlertDescription>
      </Alert>

      <SimpleGrid minChildWidth="200px" spacing="20px" mt={4}>
        {immutableFields.map((field) => (
          <ImmutableField key={field.name} field={field} />
        ))}
      </SimpleGrid>
    </Box>
  );
});

const SelectableField: FC<{ field: IField }> = observer(({ field }) => {
  const { tone } = useColorScheme();
  const handleClick = () => field.toggleExclude();
  const getProps = () => {
    const common = {
      borderRadius: "md",
      p: 2,
      pl: 0,
      cursor: "pointer",
      color: tone(700),
      fontSize: "xs",
      borderWidth: "1px",
    };

    if (!field.canExclude) return { ...common, cursor: "default", color: "gray.400", bg: "gray.75", borderColor: "gray.200" };
    if (field.excluded) return { ...common, borderColor: tone(200), onClick: handleClick };
    return { ...common, borderColor: tone(200), bg: tone(75), onClick: handleClick };
  };

  const iconColor = field.canExclude ? tone(field.excluded ? "gray.75" : tone(500)) : "gray.300";

  return (
    <Flex {...getProps()}>
      {(!field.excluded || !field.canExclude) && <Icon as={BsCheckCircleFill} color={iconColor} fontSize="large" ml={3} mr={2.5} mt={1} />}
      {field.excluded && <Icon as={BsCircle} color={tone(500)} fontSize="large" ml={3} mr={2.5} mt={1} />}
      <Box flex="1">
        <Flex>
          <Text flex="1" fontWeight="bold">
            {field.label}
          </Text>
          <Text fontSize="0.6rem" color={field.canExclude ? tone(300) : "gray.400"}>
            {field.type}
          </Text>
        </Flex>
        <Text fontSize="0.6rem" mt={-1} wordBreak="break-all">
          {field.name}
        </Text>
      </Box>
    </Flex>
  );
});

const ImmutableField: FC<{ field: IField }> = observer(({ field }) => {
  const { tone } = useColorScheme();

  const props = {
    borderRadius: "md",
    p: 2,
    pl: 0,
    cursor: "default",
    fontSize: "xs",
    borderWidth: "1px",
    color: tone(500),
    bg: tone(25),
    borderColor: tone(200),
  };

  return (
    <Flex {...props}>
      <Icon as={BsCheckCircleFill} color={tone(500)} fontSize="large" ml={3} mr={2.5} mt={1} />
      <Box flex="1">
        <Flex>
          <Text flex="1" fontWeight="bold">
            {field.label}
          </Text>
          <Text fontSize="0.6rem" color={tone(400)}>
            {field.type}
          </Text>
        </Flex>
        <Text fontSize="0.6rem" mt={-1} wordBreak="break-all">
          {field.name}
        </Text>
      </Box>
    </Flex>
  );
});
