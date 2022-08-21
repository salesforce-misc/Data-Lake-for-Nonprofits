import React from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Box, FormControl, FormErrorMessage, Heading, Select, Text } from "@chakra-ui/react";

import { ICredentialsFormInput } from "./CredentialsForm";
import { awsRegions } from "../../data/aws-regions";
import { useColorScheme } from "../../models/useColorScheme";

interface IRegionForm {
  register: UseFormRegister<ICredentialsFormInput>;
  errors: FieldErrors;
  isSubmitting: boolean;
  description: string;
  defaultRegion: string;
}

export const RegionForm = ({ register, errors, isSubmitting, description, defaultRegion }: IRegionForm) => {
  const { tone } = useColorScheme();

  return (
    <Box p={6} bg={tone(50)} borderRadius="lg" boxShadow="base">
      <Heading size="sm" pt="5px" pb="5px" color={tone(600)}>
        AWS Region
      </Heading>
      <Text fontSize="sm" color={tone(700)} mb={3}>
        {description}
      </Text>
      {/* @ts-ignore */}
      <FormControl isInvalid={errors.region || errors.region}>
        <Select bg={tone(75)} id="region" {...register("region", { required: "Required" })} defaultValue={defaultRegion} disabled={isSubmitting}>
          {awsRegions.map((item) => (
            <option key={item.name} className={item.name} value={item.name}>
              {item.label}
            </option>
          ))}
        </Select>
        <FormErrorMessage>{errors.region && errors.region.message}</FormErrorMessage>
      </FormControl>
    </Box>
  );
};
