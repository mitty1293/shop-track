[![Test Backend](https://github.com/mitty1293/shop-track/actions/workflows/test-backend.yml/badge.svg)](https://github.com/mitty1293/shop-track/actions/workflows/test-backend.yml)
[![Deploy Backend](https://github.com/mitty1293/shop-track/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/mitty1293/shop-track/actions/workflows/deploy-backend.yml)

# shop-track

ShopTrack is a full-stack web application designed to help you record and manage your daily shopping expenses. It features a separate backend API and a responsive frontend user interface, containerized with Docker for easy setup and deployment.

## Features

  * **RESTful API**: A robust backend API built with Django and Django REST Framework.
  * **Modern UI**: A responsive and intuitive user interface built with React, TypeScript, and Material-UI.
  * **Secure Authentication**: Utilizes JSON Web Token (JWT) for secure user authentication.
  * **CRUD Operations**: Full Create, Read, Update, and Delete functionality for:
      * Shopping Records
      * Products
      * Stores
      * Categories
      * And other related data models like Units, Manufacturers, and Origins.
  * **Containerized**: Both backend and frontend applications are containerized using Docker, allowing for consistent environments and simplified deployment.

## Tech Stack

### Backend

  * Python
  * Django / Django REST Framework
  * PostgreSQL (for production) / SQLite (for development)
  * djangorestframework-simplejwt (for JWT authentication)

### Frontend

  * React
  * TypeScript
  * Vite
  * Material-UI (MUI)
  * React Router
  * TanStack Query (for data fetching and state management)
  * Axios (for HTTP requests)

### Deployment

  * Docker / Docker Compose
  * Nginx (for serving the frontend)
  * Traefik (as a reverse proxy)

## Project Structure

The repository is organized into two main directories:

```
shop-track/
├── backend/      # Django REST Framework application
└── frontend/     # React (Vite + TypeScript) application
```

## Getting Started

For detailed instructions on how to set up, configure, and run each part of the application, please refer to the `README.md` files within their respective directories.

  * **Backend Setup**: [backend/README.md](backend/README.md)
  * **Frontend Setup**: [frontend/README.md](frontend/README.md)

Each `README.md` provides environment-specific guides for local development (with and without Docker) and production deployment.
