# Flight Management Microservice

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
