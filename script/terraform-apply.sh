#!/bin/sh

set -e

cd "$( dirname "${0}" )/.."

export TF_VAR_github_app_id=$GITHUB_APP_ID
export TF_VAR_github_app_private_key=$GITHUB_APP_PRIVATE_KEY

terraform apply
