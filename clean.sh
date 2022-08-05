#!/bin/bash

set -eou pipefail

cd app
npm run clean
cd ..

cd infra/

cd custom_resources
npm run clean
cd ..
cd lambdas
npm run clean
cd ..

cd ..
