# **Project Setup and Running Instructions**

This document provides the steps and information required to set up and run the application. It includes information about the services, required tools, and links for interacting with the application locally. This is basic configuration for `dev` environment.

## **Prerequisites**

Before proceeding with the setup, ensure you have the following:

1. **Docker**: Make sure Docker is installed on your machine. Docker is required to build and run the application containers.

    - You can download Docker from the official website: [Docker](https://www.docker.com/get-started).

2. **Docker Compose**: Docker Compose is also required to manage multi-container applications. It is usually bundled with Docker Desktop, but if not, you can install it separately from: [Docker Compose](https://docs.docker.com/compose/install/).

## **Services Overview**

This project includes the following services defined in `docker-compose.yml`:

1. **Redis**:
   Redis is an in-memory data structure store used as a database, cache, and message broker. This service will run a Redis container that can be accessed via port `6379`.

    - **Image**: `redis:latest`
    - **Ports**: `6379:6379` (Accessible from your machine on port 6379)
    - **Healthcheck**: Redis is checked for availability every 10 seconds, with a timeout of 5 seconds, and it will retry 5 times if necessary.

2. **MongoDB**:
   MongoDB is a NoSQL database. This service runs a MongoDB container that is accessible on port `27017`.

    - **Image**: `mongo:latest`
    - **Ports**: `27017:27017` (Accessible from your machine on port 27017)
    - **Healthcheck**: MongoDB is checked for availability every 10 seconds, with a timeout of 5 seconds, and it will retry 5 times if necessary.
    - **Environment Variables**: The default username and password are not set for MongoDB; however, they can be configured by uncommenting the environment variables `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`.

3. **MongoDB Web GUI (mongo-express)**:
   This service runs a web-based GUI for interacting with MongoDB, called `mongo-express`. It allows you to manage MongoDB data through a web interface.

    - **Image**: `mongo-express`
    - **Ports**: `8081:8081` (Accessible from your machine on port 8081)
    - **Environment Variables**: Configure the MongoDB connection URL with `ME_CONFIG_MONGODB_URL: mongodb://mongo:27017/`. By default, basic authentication is disabled (`ME_CONFIG_BASICAUTH: false`).
    - **Depends On**: This service will start only after MongoDB is healthy.

4. **School Management System (API)**:
   This is our main application service. It will be built from the provided `Dockerfile` and will be dependent on both Redis and MongoDB services.

    - **Build Context**: `.` (The current directory will be used for building the Docker image)
    - **Ports**: `5111:5111` (Accessible from your machine on port 5111)
    - **Env File**: The `.env` file should be present to supply environment variables. Rename `.env.example` to `.env` will simply be enough for now.
    - **Depends On**: The app service will only start once both the MongoDB and Redis services are healthy.

## **Running the Application**

To start the application, follow the steps below:

### Step 1: Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone
cd
```

### Step 2: Build and Start Containers

Run the following command in the root of your project directory (where the `docker-compose.yml` file is located):

```bash
docker compose up --build
```

This will:

-   Build the app container using the provided `Dockerfile`.
-   Start all the services defined in the `docker-compose.yml` file.
-   You can optionally add the `-d` flag to run the containers in the background:

```bash
docker-compose up --build -d
```

### Step 3: Accessing the Services

Once the application is up and running, you can access the following:

1. **SMS Application API**:
   The app will be running at `http://localhost:5111/`. You can use this URL to interact with application's API.

2. **MongoDB Web GUI (mongo-express)**:
   The MongoDB web interface will be available at `http://localhost:8081/`. You can use this interface to manage and visualize MongoDB data. By default, there is no authentication enabled for simplicity in `dev` environment, but you can configure it by setting `ME_CONFIG_MONGODB_ADMINUSERNAME` and `ME_CONFIG_MONGODB_ADMINPASSWORD` in the `docker-compose.yml` file.

    - **MongoDB Host**: `localhost`
    - **MongoDB Port**: `27017`

### Step 4: Stopping the Application

To stop the application, run:

```bash
docker compose down
```

This will stop all running containers.

### Step 5: Removing Containers (Optional)

If you want to completely remove the containers, volumes, and networks created by `docker-compose`, run:

```bash
docker-compose down --volumes --remove-orphans
```

This will ensure all data and container-related resources are removed.

## **Additional Information**

-   **Redis**: You can interact with Redis by connecting to it via `localhost:6379` using any Redis client.

-   **MongoDB**: MongoDB is accessible via the default port `27017`, and you can use tools like MongoDB Compass or the Mongo shell to interact with it. The MongoDB web GUI (`mongo-express`) also provides an easy-to-use interface for managing the MongoDB database.

## **Troubleshooting**

-   **Healthcheck Failures**: If a service fails the healthcheck, the dependent services will wait for it to become healthy. Check the logs of the service using:

    ```bash
    docker compose logs app # for SMS application service
    docker compose logs mongo # for MongoDB service
    docker compose logs redis # for Redis service
    docker compose logs mongo-gui # for Mongo GUI service
    ```

-   **Port Conflicts**: If you get an error about port conflicts, ensure no other service on your machine is using the same ports (e.g., `5111`, `8081`, `6379`, or `27017`).

---

## **Database Design Diagram**

![alt text](https://raw.githubusercontent.com/sbbullet/sms-api/refs/heads/feature/sms-api/Database%20Design%20of%20SMS.png)
