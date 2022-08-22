import React from "react";
import { Heading, HStack, Text } from "@chakra-ui/react";
import { observer } from "mobx-react";

import { useColorScheme } from "models/useColorScheme";

import { SubscribeForm } from "./SubscribeForm";

export const SubscribeSNSPanel = observer(() => {
  const { tone } = useColorScheme();

  return (
    <>
      <HStack justifyContent="space-between" pb="20px">
        <Heading size="md" color={tone(600)} letterSpacing="-1px">
          Subscribe to System Notifications
        </Heading>
      </HStack>
      <Text mb={3} color={tone(800)}>
        Subscribe below for the system to contact you if a problem arises.
      </Text>
      <Text mb={3} color={tone(800)}>
        It is best practice to set a group email/distribution list to receive these notifications.
      </Text>
      <SubscribeForm />
    </>
  );
});
