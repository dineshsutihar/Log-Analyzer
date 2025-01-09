# Loganalyzer

Loganalyzer is a web application consisting of a frontend and a backend connected to a MongoDB database. This project is designed to analyze logs and visualize the data in a user-friendly interface.

## Features

### Backend

- ✅ Parses Linux log files (`/var/log/syslog`)
- ✅ Stores logs in MongoDB
- ✅ Provides a REST API:
  - `/logs`: Endpoint for retrieving log data
  - `/upload`: Endpoint for uploading logs

### Upcoming Features (ToDo)

- 🔜 Provide a REST API `/logs/:id` for retrieving individual log entries
- 🔜 AI-powered issue detection & fixes (Potential integration with OpenAI or Gemini)
- 🔜 Real-time log streaming via WebSockets
- 🔜 Dashboard route for visualizing log data (date, time, count, etc.)

## Project Structure

- `frontend`: The frontend of the web application, built with a modern JavaScript framework.
- `backend`: The backend API that serves the data to the frontend, using Node.js and MongoDB.
- `db`: MongoDB container used to store the logs data.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

Follow these steps to get the project running locally:

### 1. Clone the Repository

```bash
git clone https://github.com/dineshsutihar/Log-Analyzer.git
cd Log-Analyzer
```

### 2. Setup Build and Start the Containers

You can use Docker Compose to build and start the containers. In your terminal, run the following:

```bash
docker-compose up --build
```

This will build the images for the frontend, backend, and database, and then start the services.

### 3. Access the Application

- Frontend: Open your browser and go to `http://localhost:5173` to access the web application.
- API: The backend API is available at `http://localhost:3000`.

### 4. Stopping the Application

To stop the containers, you can run:

```bash
docker-compose down
```

This will stop and remove the containers but preserve the data in the MongoDB volume.

## Folder Structure

Here is the folder structure of the project:

```
/
├── backend/                  # Backend API code
│   └── ...
├── frontend/                 # Frontend application code
│   └── ...
├── docker-compose.yml        # Docker Compose file to manage containers
└── README.md                 # This file
```

## Troubleshooting

If you face any issues while running the application, here are some common checks:

- Ensure Docker and Docker Compose are correctly installed.
- Check container logs using:
  ```bash
  docker-compose logs <service-name>
  ```
  For example, to view frontend logs:
  ```bash
  docker-compose logs web
  ```

## Development

To develop locally on your machine, follow these steps:
Also, to set up individually, you may require a `.env` file with some required data.

1. Install dependencies for the frontend and backend:

   ```bash
   # For the frontend
   cd frontend
   npm install

   # For the backend
   cd ../backend
   npm install
   ```

2. Start the frontend and backend services separately (if not using Docker Compose):

   ```bash
   # Start the backend
   npm run dev

   # Start the frontend
   npm run dev
   ```

## Docker Volumes

The project uses a Docker volume for MongoDB to persist data. You can view the volume with:

```bash
docker volume ls
```

To remove the volume (if needed):

```bash
docker volume rm mongodb_data
```

## Contributing

Feel free to fork the repository and submit pull requests for new features or bug fixes. Please make sure to write clear commit messages and follow the project's coding standards.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
