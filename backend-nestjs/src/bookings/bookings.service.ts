import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "./booking.entity";
import { Flight } from "../flights/flight.entity";
import { CreateBookingDTO } from "./dto/create-booking.dto";

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<Flight>
  ) { }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find();
  }

  async findOne(id: number): Promise<Booking | null> {
    return this.bookingRepo.findOne({ where: { id } })
  }

  async getBookingsForFlight(flightId: number): Promise<Booking[]> {
    const bookings = await this.bookingRepo.find({
      where: { flightId: flightId },
      order: { id: 'ASC' }
    })
    return bookings
  }

  async createBooking(flightId: number, dto: CreateBookingDTO): Promise<Booking> {
    const flight = await this.flightRepo.findOne({ where: { id: flightId } })
    if (!flight) {
      throw new NotFoundException(`Flight ID ${flightId} not found`)
    }

    // Basic capacity check: count confirmed bookings against flight capacity
    // Note: This simplified approach does not use pessimistic locking or seat class allocation
    const confirmed = await this.bookingRepo.count({
      where: { flightId: flightId, status: 'Confirmed' },
    })
    if (confirmed >= flight.capacity) {
      throw new BadRequestException(`Flight ${flightId} is at full capacity.`)
    }

    const booking = this.bookingRepo.create({
      ...dto,
      flightId: flight.id,
      status: 'Confirmed'
    })
    return this.bookingRepo.save(booking)
  }

  async cancelBooking(flightId: number, bookingId: number): Promise<void> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId, flightId: flightId } })
    if (!booking) {
      throw new NotFoundException(`Booking ID ${bookingId} on flight ${flightId} not found`)
    }
    await this.bookingRepo.remove(booking)
  }

}