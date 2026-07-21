provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_compute_network" "vpc_network" {
  name                    = "aurameal-vpc"
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "allow_http" {
  name    = "allow-http-8080"
  network = google_compute_network.vpc_network.name

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["aurameal-server"]
}

resource "google_compute_instance" "vm_instance" {
  name         = "aurameal-agent-instance"
  machine_type = "e2-medium"
  tags         = ["aurameal-server"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = google_compute_network.vpc_network.name
    access_config {
      // Allocate a public IP
    }
  }

  metadata_startup_script = <<-EOT
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io git
    systemctl start docker
    systemctl enable docker
    # Clone and run the AuraMeal Agent
    git clone https://github.com/yrvij/aurameal-agent.git /app
    cd /app
    docker-compose up -d
  EOT
}
