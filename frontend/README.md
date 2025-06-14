# frontend

This repository contains the frontend for the ShopTrack application. It provides the user interface and communicates with the backend API.

## Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **Routing:** React Router
- **Deployment:** Docker, Nginx

## Deployment

### 💻 Local Development Environment (without Docker)

Follow these steps to run the development server directly on your local machine.

#### 1. Install Dependencies

Make sure you have Node.js installed. Then, run the following command:

```bash
npm install
```

#### 2. Run the Development Server

```bash
npm run dev
```

#### 3. Access the Application

The development server will be available at:

[http://localhost:5173](http://localhost:5173)

### 🐳 Local Development Environment (using Docker Compose)

Follow these steps to build and run a production-like container on your local machine.

#### 1. Build and Run the Container

Navigate to the `frontend` directory and run the following command:

```bash
docker compose up --build -d
```

#### 2. Access the Application

Once the container is up and running, open your browser and go to:

[http://localhost:5173](http://localhost:5173)

### 🚀 Production Environment (Example using Docker Compose & traefik)


#### 1. Build and Run the Container

Navigate to the `frontend` directory and run the following command:

```bash
docker compose -f compose.traefik.yml up -d
```

#### 2. Access the Application

Once the container is up and running, open your browser and go to:

`https://shoptrack.${HOST_DOMAIN}`


To stop the running services:
```bash
docker compose -f compose.traefik.yml down
```