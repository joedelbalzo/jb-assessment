/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */


import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Flights API (e2e)', () => {
  let app: INestApplication;
  let server: App;
  let createdFlightId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
    )

    await app.init()
    server = app.getHttpServer()
  })

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource.query(`
    DELETE FROM bookings
    WHERE flight_id IN (
      SELECT id FROM flights
      WHERE flight_number IN ('JB-9000', 'JB-9001', 'JB-9002')
    );

    DELETE FROM flights
    WHERE flight_number IN ('JB-9000', 'JB-9001', 'JB-9002');
  `);
    await dataSource.destroy();
    await app.close();
  });

  it('POST /api/flights → should create a new flight', async () => {
    const flightData = {
      flight_number: 'JB-9000',
      origin: 'JFK',
      destination: 'LAX',
      departure_time: '2025-03-15T10:00:00Z',
      arrival_time: '2025-03-15T15:00:00Z',
      capacity: 120,
    };

    const res = await request(server).post('/api/flights').send(flightData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.flight_number).toBe(flightData.flight_number);
    expect(res.body.status).toBe('Scheduled');
    createdFlightId = res.body.id;
  });

  it('GET /api/flights?origin=JFK&destination=LAX → should return filtered flights', async () => {
    const res = await request(server)
      .get('/api/flights')
      .query({ origin: 'JFK', destination: 'LAX' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].origin).toBe('JFK');
    expect(res.body[0].destination).toBe('LAX');
  });

  it('GET /api/flights?date=2025-03-15 → should return flights matching date', async () => {
    const res = await request(server)
      .get('/api/flights')
      .query({ date: '2025-03-15' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((f: any) => f.flight_number === 'JB-9000')).toBe(true);
  });


  it('GET /api/flights → should return all flights', async () => {
    const res = await request(server).get('/api/flights');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/flights/:id → should return a flight by ID', async () => {
    const res = await request(server).get(`/api/flights/${createdFlightId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdFlightId);
    expect(res.body.flight_number).toBe('JB-9000');
  });

  it('GET /api/flights?origin=JFK&destination=LAX → should return matching flights', async () => {
    const res = await request(server)
      .get('/api/flights')
      .query({ origin: 'JFK', destination: 'LAX', date: '2025-03-15' });

    expect(res.status).toBe(200);
    expect(res.body[0].origin).toBe('JFK');
  });

  it('POST /api/flights → should reject invalid IATA code', async () => {
    const badFlight = {
      flight_number: 'JB-9001',
      origin: 'JF', // too short
      destination: 'LAX',
      departure_time: '2025-03-15T10:00:00Z',
      arrival_time: '2025-03-15T14:00:00Z',
      capacity: 100,
    };

    const res = await request(server).post('/api/flights').send(badFlight);
    expect(res.status).toBe(400);
    expect(res.body.message[0]).toContain('origin must be');
  });

  it('POST /api/flights → should reject when arrival_time is before departure_time', async () => {
    const invalidFlight = {
      flight_number: 'JB-9002',
      origin: 'JFK',
      destination: 'LAX',
      departure_time: '2025-03-15T14:00:00Z',
      arrival_time: '2025-03-15T10:00:00Z',
      capacity: 120,
    };

    const res = await request(server).post('/api/flights').send(invalidFlight);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('arrival_time must be after departure_time');
  });

  it('POST /api/flights → should reject duplicate flight_number on same date', async () => {
    const duplicateFlight = {
      flight_number: 'JB-9000', // same as createdFlightId
      origin: 'JFK',
      destination: 'LAX',
      departure_time: '2025-03-15T18:00:00Z', // same day
      arrival_time: '2025-03-15T22:00:00Z',
      capacity: 200,
    };

    const res = await request(server).post('/api/flights').send(duplicateFlight);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists on');
  });
});