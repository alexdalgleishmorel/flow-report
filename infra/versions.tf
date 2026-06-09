terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # Remote state in the shared bootstrap bucket (created by recipe's infra/bootstrap). The bucket /
  # lock table / region are supplied at init time via `-backend-config` (see README) so this file
  # stays free of account-specific names; only the key is project-specific.
  backend "s3" {
    key = "wave-report/terraform.tfstate"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project   = "wave-report"
      ManagedBy = "terraform"
    }
  }
}
