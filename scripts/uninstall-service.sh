#!/usr/bin/env bash
set -e

SERVICE_NAME="aitavista"
UNIT_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

echo "Uninstalling ${SERVICE_NAME} systemd service..."

sudo systemctl stop "${SERVICE_NAME}" 2>/dev/null || true
sudo systemctl disable "${SERVICE_NAME}" 2>/dev/null || true
sudo rm -f "${UNIT_FILE}"
sudo systemctl daemon-reload

echo "Service removed."
