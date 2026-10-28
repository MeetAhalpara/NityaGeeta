variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
  default     = "protean-smile-376716"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "domain_name" {
  description = "The custom domain for NityaGeeta"
  type        = string
  default     = "www.nityageeta.tech"
}
