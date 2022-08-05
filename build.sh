#!/bin/bash

set -eou pipefail

cd infra/

cd custom_resources
npm install "${@:2}"
cd ..

cd lambdas
npm install "${@:2}"
cd ..

cd ..

cd app
npm install "${@:2}"
