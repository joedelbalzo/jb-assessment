# Flight Management Microservice — NestJS + PostgreSQL

This project implements the Flight Management Microservice described in the assessment brief.  
It provides a REST API for creating, searching, and managing flights and bookings.

---

## Overview

**Stack**
- NestJS (TypeScript)
- PostgreSQL with TypeORM
- Jest + Supertest for end-to-end testing
- Docker + Docker Compose for containerization
- Swagger / OpenAPI documentation at `/api/docs`

The application can run entirely in Docker (API + database) or with the API alone to satisfy the “optional database integration” requirement.

---

## Project Structure

```
code-assesment-flight-management-api/
├── backend-nestjs/
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── init_db.sql
├── docker-compose.yml
└── README.md
```

---

## Run with Database Integration

From the project root:

```powershell
docker compose up --build
```

This builds and launches:
- `flight_db` – PostgreSQL 15 container  
- `flights_api` – NestJS application  

`init_db.sql` runs automatically to create tables.

Once started:
- API: http://localhost:3000/api/flights
- Swagger Docs: http://localhost:3000/api/docs  

To stop:
```powershell
docker compose down
```

---

## Run without Database Integration

To demonstrate startup without Postgres:

```powershell
docker compose up --build api
```

The API container starts normally and logs database-connection errors, confirming it can run without the database service.

---

## Local Development (non-Docker)

```powershell
cd backend-nestjs
copy .env.example .env
npm ci
npm run start:dev
```

Requires a local PostgreSQL instance at `localhost:5432`.

---

## Testing

```powershell
cd backend-nestjs
npm run test:e2e
```

Thirteen end-to-end tests validate all routes and behaviors, including:
- Flight creation and validation
- Duplicate flight checks
- Flight search query parameters
- Booking creation, capacity enforcement, and cancellation

The teardown deletes only test records and never truncates tables.

---

## Validation and Security

- All inputs validated through Nest `ValidationPipe`  
  (whitelist, forbidNonWhitelisted, and transform enabled)  
- DTOs enforce patterns for flight numbers, IATA codes, dates, and seat classes  
- Environment variables loaded from `.env`  
- No credentials or secrets stored in source  
- `JWT_SECRET` exists only to mirror the example prompt and is not used  

---

## API Summary

| Method | Route | Description |
|---------|--------|-------------|
| GET | `/api/flights` | List or search flights by origin, destination, date, etc. |
| GET | `/api/flights/:id` | Retrieve a specific flight |
| POST | `/api/flights` | Create a new flight |
| GET | `/api/flights/:id/bookings` | List bookings for a flight |
| POST | `/api/flights/:id/bookings` | Create a booking |
| DELETE | `/api/flights/:flightId/bookings/:bookingId` | Cancel a booking |

---

## Docker Configuration

The root `docker-compose.yml` defines both services:

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: flights_db
    volumes:
      - ./init_db.sql:/docker-entrypoint-initdb.d/init_db.sql:ro

  api:
    build: ./backend-nestjs
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/flights_db
    depends_on:
      db:
        condition: service_healthy
```

`backend-nestjs/Dockerfile` is a two-stage build that compiles and runs the Nest app in production mode.

---



## Author

Joe Del Balzo  
Software Engineer  
Beacon, New York  
GitHub: https://github.com/joedelbalzo  
LinkedIn: https://linkedin.com/in/joe-delbalzo



---



<br>
<br>
<br>
<br>
<br>

# Original JB README
## Flight Management Microservice

## Overview

Welcome to the Flight Management Microservice coding challenge! This project is a backend microservice for managing flight schedules, searching for flights, and handling bookings.

You can implement this using either:

- Java (Spring Boot with Gradle)
- NestJS (TypeScript)

You are free to choose one and work on it.

## Instructions for Candidates

1. **Choose a stack**: Either Spring Boot (Java with Gradle) or NestJS (TypeScript).
2. **Initialize the project** (or use the provided starter template).
3. **Implement the required APIs** based on the requirements section.
4. **Write unit tests** for your implementation.
5. **Ensure API documentation** is available (Swagger/OpenAPI preferred).
6. **Submit your code** via a GitHub repository or ZIP file.

## Project Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
cd code-assesment-flight-management-api
```

## 2. Choose Your Stack
### Option 1: Java (Spring Boot with Gradle)

```bash
cd backend-java
./gradlew bootRun
```

```bash
curl --location 'http://localhost:8080/api/hello'
```
### Option 2: NestJS (TypeScript)

```bash
cd backend-nestjs
npm run start
```

```bash
curl --location 'http://localhost:3000'
```

## 3. Implement the Following Features
### Core API Endpoints
### Create a Flight
#### POST /api/flights

Request Body:

```json
{
  "flightNumber": "JB-202",
  "origin": "JFK",
  "destination": "LAX",
  "departureTime": "2025-03-15T10:00:00Z",
  "arrivalTime": "2025-03-15T14:00:00Z",
  "capacity": 180
}
```
Response:

```json
{
  "id": 1,
  "flightNumber": "JB-202",
  "status": "Scheduled"
}
```

### Get Flight Details
#### GET /api/flights/{id}

Response:

```json
{
  "id": 1,
  "flightNumber": "JB-202",
  "origin": "JFK",
  "destination": "LAX",
  "departureTime": "2025-03-15T10:00:00Z",
  "arrivalTime": "2025-03-15T14:00:00Z",
  "status": "Scheduled"
}
```
### Search for Flights
GET /api/flights?origin=JFK&destination=LAX&date=2025-03-15

Response:

```json
[
  {
    "id": 1,
    "flightNumber": "JB-202",
    "departureTime": "2025-03-15T10:00:00Z",
    "arrivalTime": "2025-03-15T14:00:00Z",
    "status": "Scheduled"
  }
]
```
### Book a Flight
#### POST /api/flights/{id}/bookings

Request Body:

```json
{
  "passengerName": "John Doe",
  "seatClass": "Economy"
}
```
Response:

```json
{
  "bookingId": 101,
  "status": "Confirmed"
}
```

### Cancel a Booking
#### DELETE /api/flights/{id}/bookings/{bookingId}

Response:

```json
{
  "message": "Booking canceled successfully."
}
```
## 4. API endpoint validations
Please add approriate api validations for the endpoints

## 5. API Documentation
### Ensure the API is documented using Swagger/OpenAPI.

Spring Boot: http://localhost:8080/swagger-ui.html
NestJS: http://localhost:3000/api/docs

## 6. Testing
Implement basic unit tests for your API:

#### For Spring Boot:
```bash
./gradlew test
```

#### For NestJS:
```bash
npm run test
```

## 7. Docker
Provides repo has sample docker compose with postgres db(optional), Please dockerize your application to run with or without database integration.

## 8. Database (Optional)
### Database: PostgreSQL or your choice of DB

Set up has a sample init_db.sql file and docker PostgreSQL database:

#### Sample For Spring Boot (application.properties)
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/flights_db
spring.datasource.username=user
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```
#### Sample For NestJS (.env file)
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/flights_db
JWT_SECRET=mysecretkey
```

## 8. Submission Guidelines
Upload your code to a public GitHub/Gitlab repository or share a ZIP file.
Ensure the README includes setup instructions.
Write at least basic unit tests.
Follow best practices in API design, datatypes/datastructures choices, database handling(if you're using database), and security.


#### Good Luck! We look forward to reviewing your submission.
