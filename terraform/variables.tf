variable "project_id" {
  type        = string
  description = "The GCP project ID to deploy resources to."
  default     = "yrvij-ai-in-5-days"
}

variable "region" {
  type        = string
  description = "The region to deploy to."
  default     = "us-central1"
}

variable "zone" {
  type        = string
  description = "The zone to deploy to."
  default     = "us-central1-a"
}
