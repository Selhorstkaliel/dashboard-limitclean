# Dashboard LimitClean

A NestJS application with limit clean functionality.

## Docker Build Issue Fix

This repository addresses the Docker build error `sh: nest: not found` that occurs when trying to build NestJS applications in Docker containers.

### Problem

The original Docker configuration tried to run `nest build` in a production environment where only production dependencies were installed. Since `@nestjs/cli` is a devDependency, it wasn't available, causing the build to fail.

### Solution

The fix implements a multi-stage Docker build process:

1. **Builder Stage**: Installs all dependencies (including devDependencies) and compiles the application using the NestJS CLI
2. **Production Stage**: Uses only the compiled code and production dependencies, resulting in a smaller and more secure final image

### Features of the Fixed Dockerfile

- **Multi-stage build** for optimal image size
- **Security improvements** with non-root user
- **Cache optimization** with proper layer ordering
- **Clean build artifacts** removal

### Running the Application

#### Using Docker

```bash
# Build the Docker image
docker build -t dashboard-app .

# Run the container
docker run -p 3000:3000 dashboard-app
```

#### Local Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build the application
npm run build

# Run in production mode
npm run start:prod
```

## Project Structure

```
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── Dockerfile
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── .dockerignore
```

## License

MIT