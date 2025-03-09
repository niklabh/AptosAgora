#!/bin/bash

# Title
echo "==================================================================="
echo "            AptosAgora Mainnet Deployment Script"
echo "==================================================================="
echo ""

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Error: Aptos CLI is not installed."
    echo "Please install it first with:"
    echo "curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
    exit 1
fi

# Check Aptos CLI version
APTOS_VERSION=$(aptos --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
echo "✅ Aptos CLI version $APTOS_VERSION detected"

# Verify mainnet profile exists
if ! aptos config show-profiles | grep -q "mainnet"; then
    echo "⚠️ Mainnet profile not configured."
    echo "Setting up mainnet profile now..."
    aptos init --profile mainnet --network mainnet
else
    echo "✅ Mainnet profile already configured"
fi

# Get and validate account address
read -p "Enter your Aptos account address (with 0x prefix): " ADDRESS

# Basic validation of the address format
if [[ ! $ADDRESS =~ ^0x[a-fA-F0-9]{1,64}$ ]]; then
    echo "❌ Error: Invalid address format. Address should start with '0x' followed by hexadecimal characters."
    exit 1
fi

# Check account balance
echo "Checking account balance..."
BALANCE=$(aptos account list --profile mainnet --account $ADDRESS | grep -oE 'CoinStore<0x1::aptos_coin::AptosCoin> { [^}]*: [0-9]+' | grep -oE '[0-9]+$')

if [ -z "$BALANCE" ]; then
    echo "❌ Error: Could not retrieve account balance. Make sure the account exists on mainnet."
    exit 1
fi

# Convert to decimal (APT)
BALANCE_APT=$(echo "scale=4; $BALANCE/100000000" | bc)
echo "📊 Account balance: $BALANCE_APT APT"

if (( $(echo "$BALANCE_APT < 1" | bc -l) )); then
    echo "⚠️ Warning: Low balance. Deployment might cost around 1 APT depending on module size."
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ $CONTINUE != "y" ]]; then
        echo "Deployment cancelled. Please fund your account and try again."
        exit 1
    fi
fi

# Update Move.toml with correct address
echo "Updating Move.toml with your account address..."
sed -i.bak "s|aptosagora = \"0x[^\"]*\"|aptosagora = \"$ADDRESS\"|" move/Move.toml
echo "✅ Move.toml updated"

# Verify we're in the correct directory
if [ ! -d "move" ] || [ ! -f "move/Move.toml" ]; then
    echo "❌ Error: Script must be run from the project root directory containing the 'move' folder."
    exit 1
fi

# Change to move directory
cd move

# Compilation step
echo ""
echo "==================================================================="
echo "                      Compiling modules..."
echo "==================================================================="
echo ""

if ! aptos move compile --named-addresses aptosagora=$ADDRESS; then
    echo "❌ Compilation failed. Please fix any errors and try again."
    cd ..
    exit 1
fi
echo "✅ Compilation successful!"

# Module deployment order
echo ""
echo "==================================================================="
echo "                Deploying modules to mainnet..."
echo "==================================================================="
echo ""
echo "Modules will be deployed in this order:"
echo "1. creator_profiles"
echo "2. content_registry"
echo "3. reputation_system"
echo "4. recommendation_engine"
echo "5. token_economics"
echo "6. agent_framework"
echo ""

# Ask for confirmation before deploying
read -p "Ready to deploy to MAINNET? This will use real APT. (y/n): " CONFIRM
if [[ $CONFIRM != "y" ]]; then
    echo "Deployment cancelled."
    cd ..
    exit 1
fi

# Publish modules
echo "Publishing modules to mainnet..."
if ! aptos move publish --named-addresses aptosagora=$ADDRESS --profile mainnet; then
    echo "❌ Deployment failed."
    cd ..
    exit 1
fi

echo "✅ Modules successfully published to mainnet!"

# Display final instructions
echo ""
echo "==================================================================="
echo "                        Next Steps"
echo "==================================================================="
echo ""
echo "Initialize modules with the following commands if needed:"
echo ""
echo "aptos move run --function-id ${ADDRESS}::creator_profiles::init_module --profile mainnet"
echo "aptos move run --function-id ${ADDRESS}::content_registry::init_module --profile mainnet"
echo "aptos move run --function-id ${ADDRESS}::reputation_system::init_module --profile mainnet"
echo "aptos move run --function-id ${ADDRESS}::recommendation_engine::init_module --profile mainnet"
echo "aptos move run --function-id ${ADDRESS}::token_economics::init_module --profile mainnet"
echo "aptos move run --function-id ${ADDRESS}::agent_framework::init_module --profile mainnet"
echo ""
echo "⚠️ Note: Run these initialization commands only if the modules have init_module functions."
echo "⚠️ Check the module source code to confirm if initialization is needed."
echo ""
echo "==================================================================="
echo "              AptosAgora Deployment Complete!"
echo "==================================================================="

cd .. 