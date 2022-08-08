import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Box, Button, Heading, HStack, Link, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";
import { FC } from "react";
import { useColorScheme } from "../../models/useColorScheme";

export interface CloudwatchDashboardPanelProps {
  region: string;
  id: string;
}

export const CloudwatchDashboardPanel: FC<CloudwatchDashboardPanelProps> = observer(({ region, id }: CloudwatchDashboardPanelProps) => {
  const { tone, colorScheme } = useColorScheme();

  return (
    <>
      <HStack justifyContent="space-between" pb="20px">
        <Heading size="md" color={tone(600)} letterSpacing="-1px">
          Amazon CloudWatch Dashboard
        </Heading>
      </HStack>
      <Text mb={3} color={tone(800)}>
        Amazon CloudWatch dashboard can be used to monitor your resources in a single view.
      </Text>
      <Text mb={3} color={tone(800)}>
        Use the dashboard below to monitor your scheduled data import to see how long it took to run and how many records were imported.
      </Text>
      <Box textAlign="right">
        <Link href={`https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#dashboards:name=SalesforceImport-${id}`} isExternal>
          <Button colorScheme={colorScheme} size="sm">
            Open CloudWatch Dashboard <ExternalLinkIcon ml={1} />
          </Button>
        </Link>
      </Box>
    </>
  );
});
