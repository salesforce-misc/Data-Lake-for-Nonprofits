import {
  IAMClient,
  DeleteUserCommand,
  DeleteLoginProfileCommand,
  IAMServiceException,
  DeleteUserPolicyCommand,
  DetachUserPolicyCommand,
  RemoveUserFromGroupCommand,
} from "@aws-sdk/client-iam";

import { deleteAccessKey } from "./delete-access-key";
import { listAccessKeys } from "./list-access-keys";
import { listUserGroups } from "./list-user-groups";
import { listUserInlinePolicies } from "./list-user-inline-policies";
import { listUserPolicies } from "./list-user-policies";
import { CredentialsInput } from "./validate-credentials";

export interface DeleteUserInput extends CredentialsInput {
  userName: string;
}

/**
 * Deletes an IAM user. The full logic involved when deleting a user is discussed here:
 *
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-iam/classes/deleteusercommand.html
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_manage.html#id_users_deleting
 * https://docs.aws.amazon.com/IAM/latest/APIReference/API_DeleteUser.html
 *
 * For this application, we only address the following:
 *
 * - login profile
 * - access keys
 * - inline policies
 * - attached policies
 * - group memberships
 *
 */
export async function deleteUser({ accessKey, secretKey, region, userName }: DeleteUserInput): Promise<void> {
  const client = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  // Delete login profile
  try {
    await client.send(new DeleteLoginProfileCommand({ UserName: userName }));
  } catch (error) {
    if (error instanceof IAMServiceException && error.name === "NoSuchEntity") {
      // expected if there was no login profile, so this is normal, no need to throw an exception
    } else {
      throw error;
    }
  }

  // Delete inline policies
  const policyNames = await listUserInlinePolicies({ accessKey, secretKey, region, userName });
  for (const policyName of policyNames) {
    await client.send(new DeleteUserPolicyCommand({ UserName: userName, PolicyName: policyName }));
  }

  // Detach managed policies
  const policies = await listUserPolicies({ accessKey, secretKey, region, userName });
  for (const policy of policies) {
    await client.send(new DetachUserPolicyCommand({ UserName: userName, PolicyArn: policy.PolicyArn }));
  }

  // Remove from groups
  const groups = await listUserGroups({ accessKey, secretKey, region, userName });
  for (const group of groups) {
    await client.send(new RemoveUserFromGroupCommand({ UserName: userName, GroupName: group.GroupName }));
  }

  // Delete access keys
  const accessKeys = await listAccessKeys({ accessKey, secretKey, region, userName });
  for (const userAccessKey of accessKeys) {
    await deleteAccessKey({ accessKey, secretKey, region, userName, accessKeyId: userAccessKey.AccessKeyId as string });
  }

  // Finally, we are ready to delete the user
  await client.send(new DeleteUserCommand({ UserName: userName }));
}
