#!/bin/bash

set -eou pipefail

cd infra/

cd custom_resources
yarn install "${@:2}"
cd ..

cd lambdas
yarn install "${@:2}"
cd ..

cd ..

cd app
yarn install "${@:2}"
