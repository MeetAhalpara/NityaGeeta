output "artifact_registry_id" {
  description = "The ID of the Google Artifact Registry repository"
  value       = google_artifact_registry_repository.nityageeta_repo.id
}

output "backend_url" {
  description = "Direct HTTPS URL of the FastAPI Backend Cloud Run service"
  value       = google_cloud_run_service.backend_api.status[0].url
}

output "frontend_url" {
  description = "Direct HTTPS URL of the Next.js Frontend Cloud Run service"
  value       = google_cloud_run_service.frontend_app.status[0].url
}

output "custom_domain_resource_records" {
  description = "DNS Resource records required to configure at domain registrar"
  value       = google_cloud_run_domain_mapping.domain_mapping.status[0].resource_records
}
