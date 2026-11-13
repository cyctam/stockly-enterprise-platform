#!/bin/bash

# System Update
apt-get update -y
apt-get upgrade -y

# Install required packages
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    apache2-utils \
    iptables

# Enable IP forwarding
echo 'net.ipv4.ip_forward = 1' >> /etc/sysctl.conf
echo 'net.ipv6.conf.all.forwarding = 1' >> /etc/sysctl.conf
sysctl -p

# Detect network interface
INTERFACE=$(ip route | grep default | awk '{print $5}' | head -n1)

# Setup iptables untuk NAT
iptables -t nat -A POSTROUTING -o $INTERFACE -j MASQUERADE
iptables -F FORWARD

# Save iptables to file
iptables-save > /etc/iptables.rules

# Create systemd service to restore iptables on boot
cat > /etc/systemd/system/iptables-restore.service << EOF
[Unit]
Description=Restore iptables rules
After=network.target

[Service]
Type=oneshot
ExecStart=/sbin/iptables-restore < /etc/iptables.rules
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl daemon-reload
systemctl enable iptables-restore
systemctl start iptables-restore

# Cleanup
apt-get autoremove -y
apt-get autoclean

# Disable UFW
ufw disable

# Log completion
echo "$(date):  NAT instance setup completed" >> /var/log/user-data.log
