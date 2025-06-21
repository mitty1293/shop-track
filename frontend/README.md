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


1.  **Build and Push from Local Machine**
    1.  **Login to Registry:** Log in to the container registry.
        ```bash
        docker login registry-fmitty.sakuracr.jp
        ```
    2.  **Build the Image:** Build the Docker image, tagging it with the registry's path.
        ```bash
        docker build -t registry-fmitty.sakuracr.jp/shoptrack-frontend:latest .
        ```
    3.  **Push the Image:** Push the built image to the registry.
        ```bash
        docker push registry-fmitty.sakuracr.jp/shoptrack-frontend:latest
        ```
2.  **Run on Deployment Server**
    Navigate to the `frontend` project directory (where `compose.traefik.yml` is located) and run the following command.  
    This will pull the image from the registry and start the application.
    ```bash
    docker compose -f compose.traefik.yml up -d
    ```
3.  **Access:** The application should typically be available at `https://shoptrack-frontend.${HOST_DOMAIN}`.

4.  **Stopping:** To stop the running services:
    ```bash
    docker compose -f compose.traefik.yml down
    ```


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
