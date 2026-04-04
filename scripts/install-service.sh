#!/usr/bin/env bash
set -e

SERVICE_NAME="aitavista"
UNIT_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
WORKING_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_BIN="$(which node)"
USER="$(whoami)"

echo "Installing ${SERVICE_NAME} as a systemd service..."
echo "  Working dir: ${WORKING_DIR}"
echo "  Node:        ${NODE_BIN}"
echo "  User:        ${USER}"

sudo tee "${UNIT_FILE}" > /dev/null <<EOF
[Unit]
Description=AItaVista - AI-generated 90s internet simulator
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${WORKING_DIR}
ExecStart=${NODE_BIN} server.js
Restart=on-failure
RestartSec=5
EnvironmentFile=${WORKING_DIR}/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl start "${SERVICE_NAME}"

echo ""
echo "Service installed and started."
echo "  Status:  sudo systemctl status ${SERVICE_NAME}"
echo "  Logs:    journalctl -u ${SERVICE_NAME} -f"
echo "  Stop:    sudo systemctl stop ${SERVICE_NAME}"
