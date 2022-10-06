import React from "react";
import { observer } from "mobx-react";
import { Box, Text, Button, Alert, AlertDescription, Stack, AlertIcon } from "@chakra-ui/react";

import { useColorScheme } from "models/useColorScheme";
import { ClipboardField } from "components/ClipboardField";
import { IUserAccessKey } from "models/helpers/UserAccessKey";

interface IDownloadableAccessKey {
  userAccessKey: IUserAccessKey;
  userName: string;
  onDone: () => void;
}

export const DownloadableAccessKey = observer(({ userAccessKey, userName, onDone }: IDownloadableAccessKey) => {
  const { colorScheme } = useColorScheme();
  const csvValue = `User Name,Access key ID,Secret access key\n"${userName}",${userAccessKey.id},${userAccessKey.secret}`;
  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", `data:text/csv,${encodeURIComponent(csvValue)}`);
    // TODO - user name can have ,=@+-_ (so we need to deal with them as they might be a valid file name in Windows, not sure yet)
    downloadLink.setAttribute("download", `datalake-credentials-${userName}.csv`);
    downloadLink.click();
  };

  return (
    <Box fontSize="sm">
      <Alert status="success" colorScheme={colorScheme} mb={4} mt={4} borderRadius="md">
        <Box>
          <AlertDescription>
            This is your <span style={{ fontWeight: "bold" }}>ONLY</span> chance to download and view the secret access key for this user. You cannot
            recover the secret access key later. However, you can create new access keys at any time by first deleting the existing ones and creating
            new ones.
          </AlertDescription>
          <Box textAlign="right">
            <Button mt={2} colorScheme={colorScheme} size="sm" onClick={handleDownload}>
              Download .csv file
            </Button>
          </Box>
        </Box>
      </Alert>
      <Box pl={3} pr={3}>
        <Stack direction={{ base: "column", md: "row" }}>
          <Text fontWeight="bold" w="150px">
            User
          </Text>
          <ClipboardField value={userName} canCopy={false} />
        </Stack>
        <Stack direction={{ base: "column", md: "row" }}>
          <Text fontWeight="bold" w="150px">
            Access key ID
          </Text>
          <ClipboardField value={userAccessKey.id} />
        </Stack>
        <Stack direction={{ base: "column", md: "row" }}>
          <Text fontWeight="bold" w="150px">
            Secret access key
          </Text>
          <ClipboardField value={userAccessKey.secret} isPassword={true} />
        </Stack>
      </Box>
      <Alert status="warning" variant="left-accent" mt={5} fontSize="sm">
        <AlertIcon />
        Secret access keys are sensitive information, keep them secured and protected, never post them on public platforms or leave them unsecured as
        this can compromise your account security
      </Alert>
      <Box textAlign="right">
        <Button mt={4} colorScheme={colorScheme} size="sm" variant="outline" onClick={onDone}>
          Done
        </Button>
      </Box>
    </Box>
  );
});
