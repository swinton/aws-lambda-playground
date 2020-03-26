# Use S3 as our remote backend
# To initialize, run:
# terraform init \
#   -backend-config="bucket=$S3_STATE_BUCKET" \
#   -backend-config="key=$S3_STATE_KEY" \
#   -backend-config="region=$AWS_REGION"
terraform {
  backend "s3" {
    # Note: It is recommended to enable versioning on the S3 bucket (http://docs.aws.amazon.com/AmazonS3/latest/UG/enable-bucket-versioning.html), to allow for state recovery
  }
}

provider "aws" {
  version = "~> 2.54"
  region  = "${var.aws_region}"
}

provider "archive" {
  version = "~> 1.3"
}

data "archive_file" "zip" {
  type        = "zip"
  source_file = "dist/index.js"
  output_path = "dist/index.zip"
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    sid    = ""
    effect = "Allow"

    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "role" {
  name               = "${var.iam_role_name}"
  path               = "/service-role/"
  assume_role_policy = "${data.aws_iam_policy_document.assume_role_policy.json}"
}

data "aws_iam_policy_document" "policy_document" {
  statement {
    effect = "Allow"

    actions = [
      "iam:DeleteAccessKey",
      "iam:UpdateAccessKey",
      "iam:GetGroup",
      "iam:ListUserTags",
      "iam:CreateAccessKey",
      "iam:ListAccessKeys",
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "role_policy" {
  name   = "${var.iam_role_policy_name}"
  role   = "${aws_iam_role.role.id}"
  policy = "${data.aws_iam_policy_document.policy_document.json}"
}

resource "aws_lambda_function" "function" {
  function_name = "${var.lambda_function_name}"

  filename         = "${data.archive_file.zip.output_path}"
  source_code_hash = "${data.archive_file.zip.output_base64sha256}"

  role        = "${aws_iam_role.role.arn}"
  handler     = "index.handler"
  memory_size = "${var.lambda_function_memory}"
  timeout     = "${var.lambda_function_timeout}"
  runtime     = "nodejs12.x"

  environment {
    variables = {
      GITHUB_APP_ID          = "${var.github_app_id}"
      GITHUB_APP_PRIVATE_KEY = "${var.github_app_private_key}"
      GROUP_NAME             = "${var.group_name}"
      TAG_NAME               = "${var.tag_name}"
    }
  }
}

resource "aws_cloudwatch_event_rule" "trigger" {
  name = "${var.cloudwatch_event_name}"

  depends_on = [
    "aws_lambda_function.function",
  ]

  schedule_expression = "${var.cloudwatch_schedule_expression}"
}

resource "aws_cloudwatch_event_target" "target" {
  rule = "${aws_cloudwatch_event_rule.trigger.name}"
  arn  = "${aws_lambda_function.function.arn}"
}

resource "aws_lambda_permission" "permission_to_fire" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.function.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.trigger.arn}"
}
