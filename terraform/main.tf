terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Google Artifact Registry (Docker Image Repository)
resource "google_artifact_registry_repository" "nityageeta_repo" {
  location      = var.region
  repository_id = "nityageeta-repo"
  description   = "NityaGeeta Production Container Images"
  format        = "DOCKER"
}

# 2. FastAPI Backend Service on Cloud Run (Port 1866)
resource "google_cloud_run_service" "backend_api" {
  name     = "nityageeta-api"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.nityageeta_repo.repository_id}/backend:latest"
        ports {
          container_port = 1866
        }
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        env {
          name  = "PORT"
          value = "1866"
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "5"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow public unauthenticated invocations for Backend API
resource "google_cloud_run_service_iam_member" "backend_public" {
  service  = google_cloud_run_service.backend_api.name
  location = google_cloud_run_service.backend_api.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 3. Next.js Frontend Service on Cloud Run (Port 1870)
resource "google_cloud_run_service" "frontend_app" {
  name     = "nityageeta-frontend"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.nityageeta_repo.repository_id}/frontend:latest"
        ports {
          container_port = 1870
        }
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        env {
          name  = "PORT"
          value = "1870"
        }
        env {
          name  = "NEXT_PUBLIC_API_URL"
          value = google_cloud_run_service.backend_api.status[0].url
        }
        env {
          name  = "NEXT_PUBLIC_GTM_ID"
          value = "GTM-PHTNG299"
        }
      }
    }
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "5"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Allow public unauthenticated invocations for Frontend
resource "google_cloud_run_service_iam_member" "frontend_public" {
  service  = google_cloud_run_service.frontend_app.name
  location = google_cloud_run_service.frontend_app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 4. Custom Domain Mapping (www.nityageeta.tech -> Frontend)
resource "google_cloud_run_domain_mapping" "domain_mapping" {
  location = var.region
  name     = var.domain_name

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = google_cloud_run_service.frontend_app.name
  }
}
