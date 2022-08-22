import React from "react";
import { observer } from "mobx-react";
import { Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";

import { useInstallation } from "AppContext";
import { useColorScheme } from "models/useColorScheme";
import { useUsersStore } from "models/useUsersStore";

import { UserRow } from "./UserRow";

export const UsersTable = observer(() => {
  const { colorScheme } = useColorScheme();
  const installation = useInstallation();
  const { isLoading, store } = useUsersStore(installation);

  if (isLoading) return null;
  if (store.empty) return null;

  return (
    <Table variant="simple" mt={3} colorScheme={colorScheme} size="md" mb={6}>
      <Thead>
        <Tr>
          <Th pl="40px">User</Th>
          <Th w="150px">Created</Th>
          <Th w="90px">Access</Th>
          <Th w="20px"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {store.listUsers.map((user) => (
          <UserRow key={user.name} user={user} />
        ))}
      </Tbody>
    </Table>
  );
});
