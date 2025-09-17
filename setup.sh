set -e

echo "TrueBalance Local Setup"
echo "=========================="

if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first:"
    exit 1
fi


if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first:"
    exit 1
fi

echo "Docker and Docker Compose are installed"

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
        echo "Starting TrueBalance..."
        docker-compose up --build
        ;;
    2)
        echo "Starting TrueBalance with database admin UI..."
        docker-compose --profile tools up --build
        echo ""
        echo "Access points:"
        echo "   - TrueBalance App: http://localhost:5000"
        echo "   - Database Admin:  http://localhost:8080 (admin@truebalance.com / admin)"
        ;;
    3)
        echo "Building containers..."
        docker-compose build
        echo "Containers built successfully!"
        echo "   Run 'docker-compose up' to start the application"
        ;;
    4)
        echo "Cleaning up..."
        docker-compose down -v
        docker system prune -f
        echo "Cleanup complete!"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac