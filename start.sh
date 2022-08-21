#!/bin/bash

set -eou pipefail

cd app

yarn start "${@:2}"