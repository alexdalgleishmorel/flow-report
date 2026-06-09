variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "lambda_src_dir" {
  description = "Lambda source dir to zip. Plain .mjs handlers using only the runtime-bundled AWS SDK — no build step, no vendored deps."
  type        = string
  default     = "../backend/src"
}

variable "cors_allowed_origins" {
  description = "Origins allowed to call the reader Function URL (browser CORS). Defaults to the GitHub Pages site."
  type        = list(string)
  default     = ["https://alexdalgleishmorel.github.io"]
}
