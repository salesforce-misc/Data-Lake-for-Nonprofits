#!/bin/bash

set -e

query=${2:-$1}
installationId=${INSTALLATION_ID:-$1}

if [ "$query" = "" ] || [ "$installationId" = "" ]; then
    echo "Usage: ./query.sh abcdefg12345 \"SELECT * FROM account where id = '0012345678890ABCDEF';\""
    echo "   OR: INSTALLATION_ID=abcdefg12345 ./query.sh \"SELECT * FROM account where id = '0012345678890ABCDEF';\""
    exit
fi

echo "($installationId) Execute query: $query"
echo ''

executionId=$(aws athena start-query-execution --query-string "$query" --client-request-token $(openssl rand -base64 32) --query-execution-context Catalog=sf_data_$installationId,Database=public --work-group sf-workgroup-$installationId | jq -r '.QueryExecutionId')

while true
do
    status=$(aws athena get-query-execution --query-execution-id $executionId | jq -r '.QueryExecution.Status.State')
    echo -e "\r\033[1A\033[0K$status"
    if [[ "$status" = "SUCCEEDED" ]]; then
        break
    fi

    if [[ "$status" = "FAILED" ]]; then
        aws athena get-query-execution --query-execution-id $executionId | jq -r '.QueryExecution.Status' | jq
        exit
    fi
done

aws athena get-query-execution --query-execution-id $executionId | jq -r '.QueryExecution.ResultConfiguration | .OutputLocation, .EncryptionConfiguration.KmsKey' | tr '\n' ' ' | xargs -L1 bash -c 'aws s3 cp --sse aws:kms --sse-kms-key-id $1 $0 .; echo $0 | sed "s/s3.*\///g" | xargs column -s, -t; echo $0 | sed "s/s3.*\///g" | xargs rm'