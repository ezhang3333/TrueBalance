# TrueBalance - Personal Finance Tracker

A secure personal finance application that connects to your bank accounts using the Teller API, stores transaction data in PostgreSQL, and provides a beautiful React dashboard for tracking spending and managing finances.

## 🚀 Local Development Setup

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

### 🐳 Docker Commands

#### Basic Operations
```bash
# Start all services (app + database)
docker-compose up --build

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Start only app and database (no pgAdmin)
docker-compose up app postgres

# Clean everything (removes data!)
docker-compose down -v && docker system prune -f
```

#### Development Workflow
```bash
# Start development environment
docker-compose up --build

# In another terminal, watch logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app npm run db:push

# Access the database directly
docker-compose exec postgres psql -U postgres -d truebalance
```

### 🗄️ Database Management

#### Using Docker
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d truebalance

# View tables
\dt

# Exit PostgreSQL
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

### 📁 Project Structure

```
truebalance/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                 # Express backend
│   ├── auth.ts            # JWT authentication
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data access layer
│   ├── teller.ts          # Teller API integration
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schemas
├── docker-compose.yml     # Docker orchestration
├── Dockerfile            # Application container
└── .env.example          # Environment template
```

### 🔑 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | Set by Docker |
| `SESSION_SECRET` | JWT signing secret (32+ chars) | Yes | - |
| `TELLER_TOKEN_KEY` | Token encryption key (32+ chars) | Yes | - |
| `TELLER_APPLICATION_ID` | Teller app ID | Yes | - |
| `TELLER_CERTIFICATE` | Teller mTLS certificate | Yes | - |
| `TELLER_PRIVATE_KEY` | Teller private key | Yes | - |
| `TELLER_ENVIRONMENT` | Teller environment | No | sandbox |
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 5000 |

### 🔒 Getting Teller API Credentials

1. Sign up at https://teller.io/
2. Create a new application
3. Download your mTLS certificate and private key
4. Copy the application ID from your dashboard
5. Add these to your `.env` file

### 🛠️ Development Features

- **Hot Reloading**: Code changes automatically restart the server
- **Volume Mounting**: Your local files are synced with the container
- **Database Persistence**: Data survives container restarts
- **Security**: Production-ready encryption and authentication
- **Type Safety**: Full TypeScript support across frontend and backend

### 🚀 Production Deployment

For production deployment:

1. **Build production image**
   ```bash
   docker build --target production -t truebalance:prod .
   ```

2. **Use production environment**
   - Set `NODE_ENV=production`
   - Use strong, unique secrets
   - Configure production database
   - Set up proper CORS origins

3. **Security checklist**
   - Change all default passwords and secrets
   - Use environment-specific Teller credentials
   - Enable HTTPS/TLS
   - Configure proper firewall rules
   - Set up database backups

### 📊 Features

- **🏦 Bank Account Integration**: Connect real bank accounts via Teller API
- **💳 Transaction Syncing**: Automatic transaction import and categorization  
- **📈 Spending Analytics**: Visual charts and spending insights
- **🔐 Secure Authentication**: JWT-based login with password hashing
- **🛡️ Data Encryption**: AES-256-GCM encryption for sensitive tokens
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🌓 Dark Mode**: Built-in theme switching

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 🆘 Troubleshooting

#### Common Issues

**Port already in use**
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Database connection issues**
```bash
# Restart database container
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

**Permission errors**
```bash
# Fix Docker permissions (Linux/Mac)
sudo chown -R $USER:$USER .
```

**Container won't start**
```bash
# Clean up and rebuild
docker-compose down -v
docker system prune -f
docker-compose up --build
```

#### Development Tips

- Use `docker-compose logs -f app` to watch application logs
- Database data persists in Docker volumes
- Hot reloading works for both frontend and backend code
- Use the pgAdmin web interface for easy database management

For more help, check the application logs or open an issue on GitHub.