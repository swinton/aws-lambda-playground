#!/bin/sh

set -e

cd "$( dirname "${0}" )/.."

terraform init \
  -backend-config="bucket=$S3_STATE_BUCKET" \
  -backend-config="key=$S3_STATE_KEY" \
  -backend-config="region=$AWS_REGION"
