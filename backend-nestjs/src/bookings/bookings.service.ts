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

  async getBookingsForFlight(flightId: number) {
    const bookings = await this.bookingRepo.find({
      where: { flight_id: flightId },
      order: { id: 'ASC' }
    })
    if (!bookings.length) {
      throw new NotFoundException(`No bookings found on flight ${flightId}`)
    }
    return bookings
  }

  async createBooking(flightId: number, dto: CreateBookingDTO): Promise<Booking> {
    const flight = await this.flightRepo.findOne({ where: { id: flightId } })
    if (!flight) {
      throw new NotFoundException(`Flight ID ${flightId} not found`)
    }

    //not in spec, and this is very raw for the sake of simple math as opposed to airlines' algorithm IP.
    const confirmed = await this.bookingRepo.count({
      where: { flight_id: flightId, status: 'Confirmed' },
    })
    if (confirmed >= flight.capacity) {
      throw new BadRequestException(`Flight ${flightId} is at full capacity.`)
    }

    const booking = this.bookingRepo.create({
      ...dto,
      flight_id: flight.id,
      status: 'Confirmed'
    })
    return this.bookingRepo.save(booking)
  }

  async cancelBooking(flightId: number, bookingId: number): Promise<void> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId, flight_id: flightId } })
    if (!booking) {
      throw new NotFoundException(`Booking ID ${bookingId} on flight ${flightId} not found`)
    }
    await this.bookingRepo.remove(booking)
  }

}