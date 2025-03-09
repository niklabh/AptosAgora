#!/bin/bash

# Title
echo "==================================================================="
echo "      AptosAgora Module-by-Module Deployment Script (Mainnet)"
echo "==================================================================="
echo ""

# Check if Aptos CLI is installed
if ! command -v aptos &> /dev/null; then
    echo "❌ Error: Aptos CLI is not installed."
    echo "Please install it first with:"
    echo "curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
    exit 1
fi

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
BALANCE_JSON=$(aptos account list --profile mainnet --account $ADDRESS)

# Extract balance using grep and sed for JSON parsing
BALANCE=$(echo $BALANCE_JSON | grep -o '"0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>".*"value": "[0-9]*"' | grep -o '"value": "[0-9]*"' | sed 's/"value": "//g' | sed 's/"//g')

# If that fails, try Python as a fallback
if [ -z "$BALANCE" ]; then
    echo "Attempting to parse JSON with Python..."
    BALANCE=$(echo $BALANCE_JSON | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for item in data.get('Result', []):
        if '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>' in item:
            print(item['0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>']['coin']['value'])
            break
except Exception as e:
    print('')
    ")
fi

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

# Function to deploy a specific module
deploy_module() {
    local module_name=$1
    local module_path="sources/${module_name}.move"
    
    echo ""
    echo "==================================================================="
    echo "            Deploying module: $module_name"
    echo "==================================================================="

    # Check if module file exists
    if [ ! -f "$module_path" ]; then
        echo "❌ Error: Module file $module_path not found."
        return 1
    fi

    # Ask for confirmation before each module deployment
    read -p "Deploy $module_name to MAINNET? (y/n): " CONFIRM
    if [[ $CONFIRM != "y" ]]; then
        echo "Skipping $module_name deployment."
        return 0
    fi

    # Publish the specific module
    echo "Publishing $module_name to mainnet..."
    if ! aptos move publish --named-addresses aptosagora=$ADDRESS --included-artifacts sparse --profile mainnet; then
        echo "❌ Deployment of $module_name failed."
        return 1
    fi
    
    echo "✅ $module_name successfully published!"
    
    # Check if module has init_module
    if grep -q "fun init_module" "$module_path"; then
        echo "✅ Module has an init_module function which was automatically executed during deployment."
    fi
    
    # Check if module has any entry functions for additional initialization
    if grep -q "public entry fun initialize" "$module_path" || grep -q "#\[entry\].*fun initialize" "$module_path"; then
        echo "Module has an explicit initialization entry function."
        read -p "Call initialize function for $module_name? (y/n): " INIT
        if [[ $INIT == "y" ]]; then
            echo "Initializing $module_name..."
            aptos move run --function-id ${ADDRESS}::${module_name}::initialize --profile mainnet
            echo "✅ $module_name explicitly initialized!"
        else
            echo "Skipping explicit initialization of $module_name."
        fi
    fi
    
    return 0
}

# Deploy modules in correct order
modules=("creator_profiles" "content_registry" "reputation_system" "recommendation_engine" "token_economics" "agent_framework")

echo ""
echo "==================================================================="
echo "            Starting module deployment in order"
echo "==================================================================="
echo ""
echo "Modules will be deployed in this order:"
for i in "${!modules[@]}"; do
    echo "$((i+1)). ${modules[$i]}"
done
echo ""

# Final confirmation
read -p "Ready to start module-by-module deployment to MAINNET? This will use real APT. (y/n): " FINAL_CONFIRM
if [[ $FINAL_CONFIRM != "y" ]]; then
    echo "Deployment cancelled."
    cd ..
    exit 1
fi

# Deploy each module
for module in "${modules[@]}"; do
    deploy_module "$module" || { echo "❌ Deployment process aborted due to errors."; cd ..; exit 1; }
done

echo ""
echo "==================================================================="
echo "              AptosAgora Deployment Complete!"
echo "==================================================================="
echo ""
echo "All modules have been successfully deployed in the correct order."
echo ""

cd .. 