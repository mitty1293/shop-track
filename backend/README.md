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
        * Copy the full output of this command and paste it as the value for `DJANGO_SECRET_KEY` in your `.env` file.
    * **`DJANGO_ALLOWED_HOSTS`**:
        * For **local development**, `localhost, 127.0.0.1` might be sufficient.
        * For **other development**, set this to the actual domain name(s) or IP addresses from which your application will be served (e.g., `yourdomain.com, www.yourdomain.com`).
    * **`DATABASE_URL`** (or individual DB settings):
        * Configure the database connection details appropriate for the target environment (local database, production database instance, etc.).
    * **Other Variables**: Adjust any other variables present in the `.env` file as required by the specific deployment environment.

    Save the changes to your `.env` file.

### 2. Deployment by Environment
Once the `.env` file for your target environment is ready, proceed with the specific deployment instructions below.

#### A. Local Development Environment (using Docker rye)
```
rye sync
rye --env-file .env run python manage.py migrate
rye run devserver
```

#### B. Local Development Environment (using Docker Compose)

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

#### C. Production Environment (Example using Docker Compose & traefik)
1.  **Environment:** Verify your `.env` file is configured for production development (e.g., `DEBUG=False`).
2.  **Run:** Navigate to the project root directory (where `compose.traefik.yml` is located) and run:
    ```bash
    docker compose -f compose.traefik.yml up -d
    ```
3.  **Access:** The application should typically be available at `https://shoptrack.${HOST_DOMAIN}`.
4.  **Stopping:** To stop the running services:
    ```bash
    docker compose -f compose.traefik.yml down
    ```

## Test
```
rye run test
```

## API Document
You can access the API documentation in Swagger-UI format by navigating to `/api/docs/`, and in Redoc format by navigating to `/api/redoc/`.
