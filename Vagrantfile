Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"

  # ===================================================================
  # Master node — Jenkins controller
  # Explicitly named "default" to match the already-provisioned machine
  # (.vagrant/machines/default) so existing state is preserved.
  # ===================================================================
  config.vm.define "default", primary: true do |master|
    master.vm.hostname = "jenkins-master"

    # Private network so other lab VMs can reach Jenkins directly
    master.vm.network "private_network", ip: "192.168.56.10"

    # Port forwarding: Jenkins UI reachable from Windows host
    master.vm.network "forwarded_port", guest: 8080, host: 8080
    master.vm.network "forwarded_port", guest: 22,   host: 2222, id: "ssh", auto_correct: true

    master.vm.synced_folder ".", "/vagrant"

    master.vm.provider "virtualbox" do |vb|
      vb.name   = "lab1-jenkins-master"
      vb.memory = "3072"
      vb.cpus   = 2
    end

    master.vm.provision "shell", inline: <<-SHELL
      set -e
      export DEBIAN_FRONTEND=noninteractive

      echo "=== Updating system packages ==="
      apt-get update -y
      apt-get upgrade -y

      echo "=== Installing Java 21 (Jenkins >= 2.426 requires Java 21+) ==="
      apt-get install -y openjdk-21-jdk

      echo "=== Installing Maven ==="
      apt-get install -y maven

      echo "=== Installing Git and curl ==="
      apt-get install -y git curl

      echo "=== Installing Jenkins ==="
      curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key \
        | tee /usr/share/keyrings/jenkins-keyring.asc > /dev/null
      echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
        https://pkg.jenkins.io/debian-stable binary/" \
        | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
      apt-get update -y
      apt-get install -y jenkins
      systemctl enable jenkins
      systemctl start jenkins

      echo "=== Waiting for Jenkins to start ==="
      sleep 30
      echo "Jenkins initial admin password:"
      cat /var/lib/jenkins/secrets/initialAdminPassword || echo "(not yet available)"

      echo "=== Provisioning complete ==="
      echo "Jenkins: http://localhost:8080"
    SHELL
  end

  # ===================================================================
  # Agent node — used first to fire a curl trigger at the master, then
  # later registered as a Jenkins build/test agent (SSH connector).
  # ===================================================================
  config.vm.define "agent" do |agent|
    agent.vm.hostname = "jenkins-agent"

    agent.vm.network "private_network", ip: "192.168.56.11"
    agent.vm.network "forwarded_port", guest: 22, host: 2200, id: "ssh", auto_correct: true

    agent.vm.synced_folder ".", "/vagrant"

    agent.vm.provider "virtualbox" do |vb|
      vb.name   = "lab1-jenkins-agent"
      vb.memory = "2048"
      vb.cpus   = 2
    end

    agent.vm.provision "shell", inline: <<-SHELL
      set -e
      export DEBIAN_FRONTEND=noninteractive

      echo "=== Updating system packages ==="
      apt-get update -y

      echo "=== Installing Java 21, Maven, Git, curl ==="
      apt-get install -y openjdk-21-jdk maven git curl

      echo "=== Provisioning complete (agent) ==="
      java -version
      mvn -version
    SHELL
  end

  # ===================================================================
  # Deploy node — hosts the running PetClinic application. Jenkins
  # (or the agent, via Jenkinsfile "Deploy" stage) copies the built
  # JAR here over SSH/SCP and starts it.
  # ===================================================================
  config.vm.define "deploy" do |deploy|
    deploy.vm.hostname = "deploy-target"

    deploy.vm.network "private_network", ip: "192.168.56.12"
    deploy.vm.network "forwarded_port", guest: 8081, host: 8081
    deploy.vm.network "forwarded_port", guest: 22,   host: 2201, id: "ssh", auto_correct: true

    deploy.vm.synced_folder ".", "/vagrant"

    deploy.vm.provider "virtualbox" do |vb|
      vb.name   = "lab1-deploy-target"
      vb.memory = "1536"
      vb.cpus   = 1
    end

    deploy.vm.provision "shell", inline: <<-SHELL
      set -e
      export DEBIAN_FRONTEND=noninteractive

      echo "=== Updating system packages ==="
      apt-get update -y

      echo "=== Installing Java 21 (runtime only) and curl ==="
      apt-get install -y openjdk-21-jdk curl

      mkdir -p /home/vagrant/app
      chown vagrant:vagrant /home/vagrant/app

      echo "=== Provisioning complete (deploy) ==="
      java -version
    SHELL
  end
end
