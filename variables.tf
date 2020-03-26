variable "aws_region" {
  description = "The AWS region to work in."
  default     = "us-east-2"
}

variable "lambda_function_name" {
  description = "The name of the Lambda function."
  default     = "github-actions-rotate-aws-keys"
}

variable "github_app_id" {
  description = "The ID of the GitHub App, that will be used to generate tokens required for GitHub Secrets access."
}

variable "github_app_private_key" {
  description = "The base64-encoded private key of the GitHub App, that will be used to generate tokens required for GitHub Secrets access."
}

variable "group_name" {
  description = "The IAM group name containing IAM users whose access keys should be automatically rotated."
  default     = "GitHubActions"
}

variable "tag_name" {
  description = "The tag name that should exist on all IAM users whose access keys should be automatically rotated. The tag's value is used to denote the associated GitHub repo that should be updated with the user's access keys."
  default     = "repo"
}

variable "lambda_function_memory" {
  description = "The amount of memory, in MB, the Lambda Function can use at runtime."
  default     = 256
}

variable "lambda_function_timeout" {
  description = "The amount of time, in seconds, that the Lambda function has to run."
  default     = 10
}

variable "iam_role_name" {
  description = "The IAM role name, that the Lambda function will run as."
  default     = "github-actions-rotate-aws-keys-role"
}

variable "iam_role_policy_name" {
  description = "The IAM role policy name, to be associated with the IAM role the Lambda function will run as."
  default     = "github-actions-rotate-aws-keys-role-policy"
}

variable "cloudwatch_event_name" {
  description = "The name of the CloudWatch event, used to periodically trigger the Lambda function."
  default     = "github-actions-rotate-aws-keys-trigger"
}

variable "cloudwatch_schedule_expression" {
  description = "The CloudWatch event schedule, that will dictate how frequently the Lambda function will run."
  default     = "rate(1 hour)"
}
