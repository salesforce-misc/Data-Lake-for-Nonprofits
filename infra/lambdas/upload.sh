#!/bin/bash
	
# Only needed for development to upload this to the assets directory in s3.
	
installationId=${1:-demo}
export AWS_PAGER=""
	
set -xe

kmsKey=$(aws kms list-aliases | jq -r -M ".Aliases[] | select(.AliasName==\"alias/sf-assets-$installationId\") | .AliasArn")
aws s3 cp --sse aws:kms --sse-kms-key-id $kmsKey ../assets/step-function-lambdas.zip s3://sf-assets-${installationId}/assets/step-function-lambdas.zip

aws lambda update-function-code --function-name sf_pull_schema_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_update_schema_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_setup_sql_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_cleanup_sql_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_list_entities_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_finalize_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_filter_s3_listing_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_process_import_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
aws lambda update-function-code --function-name sf_status_report_${installationId} \
  --s3-bucket sf-assets-${installationId} --s3-key assets/step-function-lambdas.zip
