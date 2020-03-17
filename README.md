# `aws-lambda-playground`
> :wave: :earth_americas: a playground for **AWS Lambda** :roller_coaster:

## Bootstrap

```shell
# Encrypt token
export KEY_ID= # your CMK key ID

# Write PAT to secret.txt
cat > secret.txt

# Encrypt PAT
aws kms encrypt \
--key-id $KEY_ID \
--plaintext fileb://secret.txt \
--output text \
--query CiphertextBlob \
--profile key-encrypter > b64encodedsecret.txt

# Save b64encodedsecret.txt contents as environment var, ENCRYPTED_GITHUB_TOKEN

# Create Lambda function, and attach policy to allow KMS decryption
```

## Workflow

```shell
# Build package
npm run package
cd dist
zip function index.js

# Deploy package
aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://function.zip
```
