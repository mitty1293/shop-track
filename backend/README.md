[![Test Backend](https://github.com/mitty1293/shop-track/actions/workflows/test-backend.yml/badge.svg)](https://github.com/mitty1293/shop-track/actions/workflows/test-backend.yml)
[![Deploy Backend](https://github.com/mitty1293/shop-track/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/mitty1293/shop-track/actions/workflows/deploy-backend.yml)

# backend

## Deployment
This section outlines the steps required to deploy the application. It begins with essential environment variable preparation common to all deployment targets, followed by specific instructions for different environments.

### 1. Prepare Environment Variables (Required for ALL Environments)
Setting up environment variables correctly is crucial before deploying the application in any environment (local, staging, production, etc.).
1.  **Create the environment file:**
    Copy the example file `.env_example` to a new file named `.env`.
    ```bash
    cp .env_example .env
    ```
    **Important:** The `.env` file contains sensitive credentials. Ensure it is added to your `.gitignore` file to prevent committing it to version control.

2.  **Configure Environment Variables:**
    Open the `.env` file you just created and modify the following variables:

    * **`DEBUG`**:
        * Set this variable appropriately for your environment (e.g., `DEBUG=True` for development, `DEBUG=False` for production).
    * **`DJANGO_SECRET_KEY`**:
        * Generate a unique and cryptographically strong secret key specifically for **each environment** (especially production).
        * Run the following command in your terminal (Requires Python 3.6+) to generate a suitable key:
            ```bash
            python -c "import string, secrets; allowed_chars = string.ascii_letters + string.digits + '@#$%^&*(-_=+)'; print(''.join(secrets.choice(allowed_chars) for _ in range(50)))"
            ```
        * If python is not installed:
            ```bash
            head /dev/urandom | tr -dc 'a-zA-Z0-9!@#$%^&*(-_=+)' | head -c 50
            ```
        * Copy the full output of this command and paste it as the value for `DJANGO_SECRET_KEY` in your `.env` file.
    * **`DJANGO_ALLOWED_HOSTS`**:
        * For **local development**, `localhost, 127.0.0.1` might be sufficient.
        * For **other development**, set this to the actual domain name(s) or IP addresses from which your application will be served (e.g., `yourdomain.com, www.yourdomain.com`).  
        Check the value in repository's GitHub Variables and set it.
    * **`DJANGO_CORS_ALLOWED_ORIGINS`**:
        * A comma-separated list of origins that are authorized to make cross-site HTTP requests.
        * For **local development**, the default is `http://localhost:5173,http://127.0.0.1:5173`.
        * For **production**, set this to the full origin of your frontend application (e.g., `https://yourdomain.com, https://www.yourdomain.com`).  
        Check the value in repository's GitHub Variables and set it.
    * **`DATABASE_URL`** (or individual DB settings):
        * Configure the database connection details appropriate for the target environment (local database, production database instance, etc.).
        * If DEBUG=True, SQLite is used regardless of the setting value. (see `shoptrack/settings.py`)
        * For Production, Retrieve the connection string for your production database from your database provider's dashboard and set it.
    * **`CONTAINER_REGISTRY_URL`**:
        * The hostname of the container registry you are pushing to.
        * Check the value in repository's GitHub Variables and set it.
    * **`IMAGE_TAG`**:
        * The name and tag you want to assign to your built Docker image.
        * Get the latest tag name to be deployed by running the following command on the server:
            ```bash
            git describe --tags --abbrev=0
            ```
    * **Other Variables**: Adjust any other variables present in the `.env` file as required by the specific deployment environment.

    Save the changes to your `.env` file.

### 2. Deployment by Environment
Once the `.env` file for your target environment is ready, proceed with the specific deployment instructions below.

#### A. 💻 Local Development Environment (using rye)

1.  **Environment:** Verify your `.env` file is configured for local development (e.g., `DEBUG=True`, local database connection).
2.  **Run:** Navigate to the project root directory (where `pyproject.toml` is located) and run:
```bash
rye sync
rye run migrate
rye run devserver
```
The server will start at `http://localhost:8000`.

#### B. 🐳 Local Development Environment (using Docker Compose)

These steps describe how to run the application locally for development purposes.

1.  **Environment:** Verify your `.env` file is configured for local development (e.g., `DEBUG=True`, local database connection).
2.  **Run:** Navigate to the project root directory (where `compose.yml` is located) and run:
    ```bash
    docker compose up -d
    ```
3.  **Access:** The application should typically be available at `http://localhost:8000` (or the port specified in your `compose.yml`).
4.  **Stopping:** To stop the running services:
    ```bash
    docker compose down
    ```

#### C. 🚀 Production Environment (Example using Docker Compose & traefik)

Deployment for this project is **automated** via GitHub Actions.  
This section describes the manual deployment procedure for **emergency situations** or for local verification.

1.  **Build and Push Docker Image from Local Machine**
    First, build the application's Docker image on your local machine and push it to your container registry.

    1. **Prepare Environment Variables:** Set the following environment variables in your terminal.
        * **`CONTAINER_REGISTRY_URL`**:
            * Navigate to your GitHub repository's `Settings > Secrets and variables > Actions > Variables` tab and copy the value of `CONTAINER_REGISTRY_URL`.
        * **`IMAGE_TAG`**:
            * Get the version of the Git tag you want to deploy with the following command:
                ```bash
                git describe --tags --abbrev=0
                ```
        
        Use the retrieved values to run the following commands:
        ```bash
        export CONTAINER_REGISTRY_URL="<paste-the-url-from-github-variables>"
        export IMAGE_TAG=$(git describe --tags --abbrev=0)

        # Verify the variables are set
        echo $CONTAINER_REGISTRY_URL
        echo $IMAGE_TAG
        ```
    2.  **Login to Registry:** Log in to the container registry.
        ```bash
        docker login ${CONTAINER_REGISTRY_URL}
        ```
    3.  **Build the Image:** Build the Docker image, tagging it with the registry's path.
        ```bash
        docker build -t ${CONTAINER_REGISTRY_URL}/shoptrack-backend:${IMAGE_TAG} .
        ```
    4.  **Push the Image:** Push the built image to the registry.
        ```bash
        docker push ${CONTAINER_REGISTRY_URL}/shoptrack-backend:${IMAGE_TAG}
        ```

2.  **Run on Deployment Server**
    Next, connect to your deployment server via SSH and start the container using the image you pushed.

    1.  **Prerequisite:** Before running the application, ensure the deployment server is authenticated with the container registry.  
        This is typically a one-time setup command performed during server provisioning.
        ```bash
        # (Example) Run this once when setting up the server
        docker login <CONTAINER_REGISTRY_URL>
        ```
    2.  **Prepare Environment:** First, ensure your `.env` file is configured for production (e.g., `DEBUG=False`).
    3.  **Run:** Navigate to the `backend` project directory (where `compose.traefik.yml` is located) and run the following command.  
        This will pull the image from the registry and start the application.
        ```bash
        docker compose -f compose.traefik.yml up -d
        ```
3.  **Access:** The application should typically be available at `https://shoptrack-backend.${HOST_DOMAIN}`.
4.  **Stopping:** To stop the running services:
    ```bash
    docker compose -f compose.traefik.yml down
    ```

## Test
```
rye run test
```

## User Management
API users are created and managed through the Django Admin interface. This application does not provide an open user registration API.

1.  **Create Superuser**:
    If you haven't already, create a superuser to access the admin panel:
    ```bash
    rye run createsuperuser
    ```
    Follow the prompts to set the username and password.

2.  **Access Django Admin**:
    Go to `/admin/` in your browser (e.g., `http://localhost:8000/admin/`) and log in.

3.  **Manage Users**:
    In the Django Admin, navigate to "Authentication and Authorization" > "Users" to add, delete, or modify user accounts and their permissions.

## Authentication
This API uses JWT (JSON Web Token) for authentication, implemented with the `djangorestframework-simplejwt` library.

### Authentication Endpoints
* **Obtain Token (Login)**: `POST /api/auth/token/`
    * Requires `username` and `password` in the request body.
    * Returns `access` and `refresh` tokens.
* **Refresh Access Token**: `POST /api/auth/token/refresh/`
    * Requires a valid `refresh` token in the request body.
    * Returns a new `access` token.
* **Verify Access Token**: `POST /api/auth/token/verify/` (Optional)
    * Requires an `access` token in the request body to check its validity.

### API Request Authorization
Include the access token in the `Authorization` header for protected endpoints:
```
Authorization: Bearer <your_access_token>
```

## API Document
You can access the API documentation in Swagger-UI format by navigating to `/api/docs/`, and in Redoc format by navigating to `/api/redoc/`.
