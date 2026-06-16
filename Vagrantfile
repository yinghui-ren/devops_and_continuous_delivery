Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"

  # Port forwarding: Jenkins UI and deployed app
  config.vm.network "forwarded_port", guest: 8080, host: 8888, host_ip: "127.0.0.1"   # Jenkins
  config.vm.network "forwarded_port", guest: 8081, host: 8081, host_ip: "127.0.0.1"   # Node/Express app
  config.vm.network "forwarded_port", guest: 22,   host: 2222, id: "ssh", auto_correct: true

  config.vm.provider "virtualbox" do |vb|
    vb.name   = "lab1-jenkins"
    vb.memory = "3072"
    vb.cpus   = 2
  end

  config.vm.provision "shell", inline: <<-SHELL
    set -e
    export DEBIAN_FRONTEND=noninteractive

    echo "=== Updating system packages ==="
    apt-get update -y
    apt-get upgrade -y

    echo "=== Installing Java 17 ==="
    apt-get install -y openjdk-17-jdk

    echo "=== Installing Maven ==="
    apt-get install -y maven

    echo "=== Installing base tools ==="
    apt-get install -y git curl wget gnupg ca-certificates fontconfig

    echo "=== Installing OpenSSL 1.1 compatibility library for MongoDB tests ==="
    wget -O /tmp/libssl1.1.deb \
      http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb
    apt-get install -y /tmp/libssl1.1.deb

    echo "=== Installing Node.js 22 ==="
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
    node --version
    npm --version

    echo "=== Installing Jenkins ==="
    mkdir -p /etc/apt/keyrings
    wget -O /etc/apt/keyrings/jenkins-keyring.asc \
      https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key
    chmod 644 /etc/apt/keyrings/jenkins-keyring.asc
    echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] \
      https://pkg.jenkins.io/debian-stable binary/" \
      | tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    apt-get update -y
    apt-get install -y openjdk-21-jre jenkins
    systemctl enable jenkins
    systemctl start jenkins

    echo "=== Waiting for Jenkins to start ==="
    sleep 30
    echo "Jenkins initial admin password:"
    cat /var/lib/jenkins/secrets/initialAdminPassword || echo "(not yet available)"

    echo "=== Provisioning complete ==="
    echo "Jenkins: http://localhost:8888"
    echo "App:     http://localhost:8081/catalog"
  SHELL
end
