Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"

  # ===================================================================
  # VM1 — Jenkins controller (used from the HARD tier onward, once we
  # register VM2 as a Docker-based build agent).
  # ===================================================================
  config.vm.define "vm1" do |vm1|
    vm1.vm.hostname = "lab2-vm1"

    vm1.vm.network "private_network", ip: "192.168.57.10"
    vm1.vm.network "forwarded_port", guest: 8080, host: 8090
    vm1.vm.network "forwarded_port", guest: 22,   host: 2210, id: "ssh", auto_correct: true

    vm1.vm.synced_folder ".", "/vagrant"

    vm1.vm.provider "virtualbox" do |vb|
      vb.name   = "lab2-vm1-jenkins"
      vb.memory = "3072"
      vb.cpus   = 2
    end

    vm1.vm.provision "shell", inline: <<-SHELL
      set -e
      export DEBIAN_FRONTEND=noninteractive

      echo "=== Updating system packages ==="
      apt-get update -y

      echo "=== Installing Java 21 (Jenkins >= 2.426 requires Java 21+) ==="
      apt-get install -y openjdk-21-jdk

      echo "=== Installing Git and curl ==="
      apt-get install -y git curl

      echo "=== Installing Jenkins ==="
      curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key \
        | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
      echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
        https://pkg.jenkins.io/debian-stable binary/" \
        | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
      apt-get update -y
      apt-get install -y jenkins
      systemctl enable jenkins
      systemctl start jenkins

      echo "=== Provisioning complete (vm1 / Jenkins) ==="
    SHELL
  end

  # ===================================================================
  # VM2 — Docker host. This is where the EASY tier work happens:
  # install Docker, build/tag/push a container image.
  # ===================================================================
  config.vm.define "vm2" do |vm2|
    vm2.vm.hostname = "lab2-vm2"

    vm2.vm.network "private_network", ip: "192.168.57.11"
    vm2.vm.network "forwarded_port", guest: 8082, host: 8082
    vm2.vm.network "forwarded_port", guest: 22,   host: 2211, id: "ssh", auto_correct: true

    vm2.vm.synced_folder ".", "/vagrant"

    vm2.vm.provider "virtualbox" do |vb|
      vb.name   = "lab2-vm2-docker"
      vb.memory = "2048"
      vb.cpus   = 2
    end

    vm2.vm.provision "shell", inline: <<-SHELL
      set -e
      export DEBIAN_FRONTEND=noninteractive

      echo "=== Updating system packages ==="
      apt-get update -y

      echo "=== Installing Docker Engine (official apt repo) ==="
      apt-get install -y ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
        | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg

      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null

      apt-get update -y
      apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

      # Let the vagrant user run docker without sudo
      usermod -aG docker vagrant

      systemctl enable docker
      systemctl start docker

      echo "=== Provisioning complete (vm2 / Docker) ==="
      docker --version
    SHELL
  end
end
