# `aws-lambda-playground`
> :wave: :earth_americas: a playground for **AWS Lambda** :roller_coaster:

## Bootstrap

```shell
# TODO cloudformationsomethingsomething...
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
