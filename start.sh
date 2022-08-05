#!/bin/bash

set -eou pipefail

cd app

npm run start "${@:2}"