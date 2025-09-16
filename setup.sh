#!/bin/bash

# TrueBalance Local Setup Script
# This script helps you get TrueBalance running locally with Docker

set -e

echo "🚀 TrueBalance Local Setup"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit the .env file with your actual Teller API credentials!"
    echo "   Get them from: https://teller.io/"
    echo ""
    echo "   Required variables to update:"
    echo "   - TELLER_APPLICATION_ID"
    echo "   - TELLER_CERTIFICATE"
    echo "   - TELLER_PRIVATE_KEY"
    echo "   - SESSION_SECRET (use a strong 32+ character secret)"
    echo "   - TELLER_TOKEN_KEY (use a strong 32+ character secret)"
    echo ""
    
    read -p "Press Enter to continue after updating .env file..."
else
    echo "✅ .env file already exists"
fi

# Ask user what they want to do
echo ""
echo "What would you like to do?"
echo "1) Start TrueBalance (app + database)"
echo "2) Start with database admin UI (includes pgAdmin)"
echo "3) Just build the containers"
echo "4) Clean up everything"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "🚀 Starting TrueBalance..."
        docker-compose up --build
        ;;
    2)
        echo "🚀 Starting TrueBalance with database admin UI..."
        docker-compose --profile tools up --build
        echo ""
        echo "🌐 Access points:"
        echo "   - TrueBalance App: http://localhost:5000"
        echo "   - Database Admin:  http://localhost:8080 (admin@truebalance.com / admin)"
        ;;
    3)
        echo "🔨 Building containers..."
        docker-compose build
        echo "✅ Containers built successfully!"
        echo "   Run 'docker-compose up' to start the application"
        ;;
    4)
        echo "🧹 Cleaning up..."
        docker-compose down -v
        docker system prune -f
        echo "✅ Cleanup complete!"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Useful commands:"
echo "   docker-compose up          # Start the application"
echo "   docker-compose down        # Stop the application"
echo "   docker-compose logs -f     # View logs"
echo "   docker-compose logs -f app # View only app logs"
echo ""
echo "📖 For more information, see the README.md file"