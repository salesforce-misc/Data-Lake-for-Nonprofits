import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";

export const getProfiles = async () => {
  const profiles = [];

  const fileContent = await loadSharedConfigFiles();

  for (const [key] of Object.entries(fileContent?.credentialsFile)) {
    profiles.push(key);
  }

  return profiles;
};
