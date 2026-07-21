output "public_ip" {
  value       = google_compute_instance.vm_instance.network_interface[0].access_config[0].nat_ip
  description = "The public IP address of the AuraMeal server VM."
}
