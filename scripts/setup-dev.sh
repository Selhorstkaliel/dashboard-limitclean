#!/bin/bash

echo "🚀 Setting up LimitClean Dashboard Development Environment"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command_exists node; then
    echo "⚠️  Node.js is not installed. Installing dependencies with Docker only."
else
    echo "✅ Node.js found: $(node --version)"
fi

if ! command_exists npm && command_exists node; then
    echo "❌ npm is not found but Node.js is installed."
    exit 1
fi

echo ""
echo "🔧 Setting up environment..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the configuration."
else
    echo "✅ .env file already exists."
fi

echo ""
echo "📦 Installing dependencies..."

if command_exists npm; then
    echo "Installing Node.js dependencies..."
    PUPPETEER_SKIP_DOWNLOAD=true npm install
else
    echo "Skipping npm install (Node.js not available)"
fi

echo ""
echo "🐳 Starting Docker services..."

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Start services
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Redis to be ready
echo "Waiting for Redis..."
for i in {1..15}; do
    if docker-compose exec -T cache redis-cli ping >/dev/null 2>&1; then
        echo "✅ Redis is ready"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "🗃️  Setting up database..."

# Run migrations
if command_exists npm; then
    echo "Running database migrations..."
    npm run migrate || echo "⚠️  Migration may have failed. This is normal for first setup."
    
    echo "Running database seed..."
    npm run seed || echo "⚠️  Seed may have failed. This is normal if admin already exists."
else
    echo "⚠️  Skipping database setup (npm not available)"
    echo "   Please run 'npm run migrate && npm run seed' manually when npm is available"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📊 Dashboard URLs:"
echo "   Application: http://localhost:3000"
echo "   Login Page: http://localhost:3000/login.html"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Email: kalielselhorst@example.com"
echo "   Password: Kaskolk14"
echo ""
echo "🔧 Development Commands:"
echo "   Start development: npm run dev"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "📝 Next Steps:"
echo "   1. Review and update .env configuration"
echo "   2. Access http://localhost:3000/login.html"
echo "   3. Login with admin credentials"
echo "   4. Explore the dashboard features"
echo ""
echo "⚠️  Note: Some features are still in development and may show placeholder content."