#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Arguments ---
USER=$1
IP=$2
PATH_DIR=$3
SERVER_NAME=$4
KEY_FILE_PATH=$5 # Path to the temporary SSH key file, or "none"

# --- Cleanup Function ---
# This function will be called on script exit to ensure the key is removed.
cleanup() {
  if [ -n "$KEY_FILE_PATH" ] && [ "$KEY_FILE_PATH" != "none" ] && [ -f "$KEY_FILE_PATH" ]; then
    echo " "
    echo "🔑 Cleaning up temporary SSH key..."
    rm -f "$KEY_FILE_PATH"
    echo "✅ Cleanup complete."
  fi
}

# Register the cleanup function to run on script exit (EXIT signal)
trap cleanup EXIT

# --- Script ---
echo "---"
echo "🚀 Triggering remote deployment for '$SERVER_NAME'..."
echo "   - Target: ${USER}@${IP}"
echo "   - Path: ${PATH_DIR}"
echo "   - Timestamp: $(date)"
echo "---"

# --- Build SSH Command ---
SSH_OPTIONS="-o StrictHostKeyChecking=no -o BatchMode=yes"
if [ -n "$KEY_FILE_PATH" ] && [ "$KEY_FILE_PATH" != "none" ]; then
  echo "   - Using provided SSH key: $KEY_FILE_PATH"
  SSH_OPTIONS="$SSH_OPTIONS -i $KEY_FILE_PATH"
fi
echo "---"

echo " "
echo "🔗 Attempting to connect via SSH..."
sleep 1

# --- THE NEW CORE LOGIC ---
# Connect to the remote server, change to the specified directory,
# and then execute the deploy.sh script located in that directory.
ssh $SSH_OPTIONS ${USER}@${IP} "
  echo '✅ SSH Connection successful.'
  echo ' '
  echo \"➡️  Navigating to ${PATH_DIR}...\"
  
  # Change directory AND then execute the script.
  # Using '&&' ensures the script only runs if 'cd' is successful.
  cd ${PATH_DIR} && ./deploy.sh
"

echo " "
echo "---"
echo "✅ REMOTE SCRIPT TRIGGERED SUCCESSFULLY"
echo "---"

# The 'trap' will handle the cleanup automatically when the script exits here.
