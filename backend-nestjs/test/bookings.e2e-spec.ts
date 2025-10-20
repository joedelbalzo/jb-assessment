import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Bookings API (e2e)', () => {
  let app: INestApplication;
  let server: App;
  let flightId: number;
  let bookingId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    }));
    await app.init()
    server = app.getHttpServer()

    const flightRes = await request(server)
      .post('/api/flights')
      .send({
        flight_number: 'JB-777',
        origin: 'JFK',
        destination: 'AUK',
        departure_time: "2025-03-15T10:00:00Z",
        arrival_time: "2025-03-15T10:01:00Z",
        capacity: 1
      })

    flightId = flightRes.body.id
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /api/flights/:id/bookings --> should create a booking', async () => {
    const res = await request(server)
      .post(`/api/flights/${flightId}/bookings`)
      .send({ passenger_name: 'Joe Del Balzo', seat_class: 'First Class' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.status).toBe('Confirmed')
    bookingId = res.body.id
  });

  it('POST /api/flights/:id/bookings --> should reject if flight is full', async () => {
    const res = await request(server)
      .post(`/api/flights/${flightId}/bookings`)
      .send({ passenger_name: 'Joe Del Balzo', seat_class: 'First Class' })

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('at full capacity');
  });

  it('POST /api/flights/:id/bookings --> should reject invalid seat_class', async () => {
    const invalidRes = await request(server)
      .post(`/api/flights/${flightId}/bookings`)
      .send({ passenger_name: 'Joe Del Balzo', seat_class: 'Premium' })

    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.message[0]).toContain('seat_class must be');
  });

  it('POST /api/flights/:id/bookings/:bookingId --> should cancel booking', async () => {
    const res = await request(server)
      .delete(`/api/flights/${flightId}/bookings/${bookingId}`)
      .send({ passenger_name: 'Joe Del Balzo', seat_class: 'Premium' })

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Booking canceled successfully');
  });

  it('DELETE /api/flights/:id/bookings/:bookingId → should 404 for non-existent booking', async () => {
    const res = await request(server).delete(
      `/api/flights/${flightId}/bookings/99999`,
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('not found');
  });
})