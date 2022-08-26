import last from "lodash/last";
import trim from "lodash/trim";
import some from "lodash/some";
import { STSClient, GetCallerIdentityCommand, STSServiceException } from "@aws-sdk/client-sts";
import {
  IAMClient,
  IAMServiceException,
  ListAttachedUserPoliciesCommand,
  ListAttachedUserPoliciesCommandInput,
  ListAttachedUserPoliciesCommandOutput,
} from "@aws-sdk/client-iam";

import { isLocalDev } from "../helpers/settings";

export interface CredentialsInput {
  accessKey: string;
  secretKey: string;
  region: string;
}

export enum CredentialsValidationErrorCode {
  NotAdmin = "NOT_ADMIN",
  InvalidKeys = "INVALID_KEYS",
  AccountMismatch = "ACCOUNT_MISMATCH",
  Unknown = "UNKNOWN",
}

export interface CredentialsValidationResult {
  accountId: string;
  userArn: string;
  userName?: string;
}

export class CredentialsValidationException extends Error {
  code: CredentialsValidationErrorCode;
  rootCause: Error | undefined;
  constructor(code: CredentialsValidationErrorCode, rootCause?: Error) {
    super(rootCause ? `${code} - rootCause.message` : `${code}`);
    this.name = "ValidationError";
    this.code = code;
    this.rootCause = rootCause;
  }
}

/**
 * Validates if the credentials are for an admin. If not, an exception is thrown.
 * Validating the credentials includes the following steps:
 * - Get the account id and user arn by calling caller identity
 * - Get the managed policies attached to the principal and ensure that one of them is AdministratorAccess
 *
 * If all checks out, this function returns the account id and the user name
 */
export async function validateCredentials({ accessKey, secretKey, region }: CredentialsInput): Promise<CredentialsValidationResult> {
  accessKey = trim(accessKey);
  secretKey = trim(secretKey);

  const stsClient = new STSClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  const iamClient = new IAMClient({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });

  let userName: string;
  let accountId: string;
  let arn: string;

  try {
    // Get the account id and the user arn
    const stsData = await stsClient.send(new GetCallerIdentityCommand({}));
    const { Account, Arn } = stsData;
    accountId = Account as string;
    arn = Arn as string;
  } catch (err: any) {
    let code = CredentialsValidationErrorCode.Unknown;

    // InvalidClientTokenId => incorrectly copied, or inactive or deleted
    if (err instanceof STSServiceException) {
      if (err.name === "InvalidClientTokenId" || err.name === "SignatureDoesNotMatch") code = CredentialsValidationErrorCode.InvalidKeys;
    }

    throw new CredentialsValidationException(code, err);
  }

  if (arn === `arn:aws:iam::${accountId}:root`) {
    // For now, we consider the root credentials as valid, although it is not a good idea for the
    // user to provide root credentials
    return { accountId, userArn: arn };
  }

  if (!arn?.startsWith(`arn:aws:iam::${accountId}:user/`)) {
    // We don't know what the principal is so we consider the credentials invalid
    throw new CredentialsValidationException(CredentialsValidationErrorCode.Unknown);
  }

  try {
    // Get the managed policies attached to the principal and ensure that one of them is AdministratorAccess
    userName = last(arn.split("/")) as string;

    if (isLocalDev) {
      // For local dev, we need to skip the checking of the AdministratorAccess policy
      // TODO - re-examine this logic later
      return { accountId, userArn: arn, userName };
    }

    let params: ListAttachedUserPoliciesCommandInput = { UserName: userName, MaxItems: 999 };
    let found = false;
    let iamData: ListAttachedUserPoliciesCommandOutput;

    do {
      iamData = await iamClient.send(new ListAttachedUserPoliciesCommand(params));
      found = some(iamData.AttachedPolicies, { PolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess" });
      params.Marker = iamData.Marker;
    } while (!found && iamData.IsTruncated);

    if (!found) {
      throw new CredentialsValidationException(CredentialsValidationErrorCode.NotAdmin);
    }

    return { accountId, userArn: arn, userName };
  } catch (err) {
    let code = CredentialsValidationErrorCode.Unknown;

    if (err instanceof IAMServiceException) {
      if (err.name === "AccessDenied") code = CredentialsValidationErrorCode.NotAdmin;
    }

    if (err instanceof CredentialsValidationException) {
      throw err;
    }

    throw new CredentialsValidationException(code, err as Error);
  }
}
