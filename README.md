# TrueBalance - Personal Finance Tracker

A secure personal finance application that connects to your bank accounts using the Teller API, stores transaction data in PostgreSQL, and provides a React dashboard for tracking spending

## Local Development Setup

### Prerequisites

- **Docker & Docker Compose** installed on your machine
- **Git** for cloning the repository  
- **VS Code** or your preferred code editor

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd truebalance
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your actual values:
   - Add your Teller API credentials from https://teller.io/
   - Change the default security keys to strong random values

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - **TrueBalance App**: http://localhost:5000
   - **Database Admin** (optional): http://localhost:8080
     - Run with: `docker-compose --profile tools up pgadmin`
     - Login: admin@truebalance.com / admin


#### Basic Operations
```bash
# (app + database)
docker-compose up --build

docker-compose up -d

docker-compose down

docker-compose logs -f

# (no pgAdmin)
docker-compose up app postgres

docker-compose down -v && docker system prune -f
```

#### Development Workflow
```bash
docker-compose up --build

# logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app npm run db:push

# Access the database directly
docker-compose exec postgres psql -U postgres -d truebalance
```

### Database Management

#### Using Docker
```bash
docker-compose exec postgres psql -U postgres -d truebalance

\dt

\q
```

#### Using pgAdmin (Web UI)
1. Start pgAdmin: `docker-compose --profile tools up pgadmin`
2. Open http://localhost:8080
3. Login with: admin@truebalance.com / admin
4. Add server connection:
   - Host: postgres
   - Port: 5432
   - Database: truebalance
   - Username: postgres
   - Password: password