import React from "react";
import { Box, HStack, useClipboard, Tooltip, Text, Heading } from "@chakra-ui/react";
import { CheckCircleIcon, CopyIcon, DownloadIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react";

import { useInstallation } from "../../AppContext";
import { useColorScheme } from "../../models/useColorScheme";

export const AthenaProperties = observer(() => {
  const installation = useInstallation();
  const workgroup = installation.athenaPrimaryWorkGroup;
  const { tone } = useColorScheme();
  const value = `Workgroup=${workgroup}\nMetadataRetrievalMethod=ProxyAPI`;
  const { hasCopied, onCopy } = useClipboard(value, 500);

  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", `data:text/plain,${encodeURIComponent(value)}`);
    downloadLink.setAttribute("download", "athena.properties");
    downloadLink.click();
  };

  return (
    <>
      <HStack color={tone(700)} mb={2}>
        {/* <Text fontWeight="bold" pl={2} pr={3}> */}
        <Heading cursor="pointer" size="sm" pt="0px" mr={2} color={tone(600)} letterSpacing="-1px">
          athena.properties
        </Heading>

        <Tooltip label={hasCopied ? "Copied" : "Copy"}>{hasCopied ? <CheckCircleIcon /> : <CopyIcon cursor="pointer" onClick={onCopy} />}</Tooltip>

        <Box pl={2} pb={1}>
          <Tooltip label="Download">
            <DownloadIcon cursor="pointer" onClick={handleDownload} />
          </Tooltip>
        </Box>
      </HStack>

      <Box bg={tone(75)} p={3} borderRadius="lg" mb={5} color={tone(700)}>
        <Text display="block" fontSize="sm">
          Workgroup={workgroup}
        </Text>

        <Text display="block" fontSize="sm">
          MetadataRetrievalMethod=ProxyAPI
        </Text>
      </Box>
    </>
  );
});
