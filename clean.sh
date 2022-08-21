#!/bin/bash

set -eou pipefail

cd app
yarn clean
cd ..

cd infra/

cd custom_resources
yarn clean
cd ..
cd lambdas
yarn clean
cd ..

cd ..
