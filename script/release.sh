#!/bin/sh

set -e

# Build package
npm run package
cd dist
zip function index.js

# Deploy package
aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://function.zip
