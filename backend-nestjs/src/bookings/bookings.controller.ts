import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { Booking } from "./booking.entity";
import { CreateBookingDTO } from "./dto/create-booking.dto";
import { Throttle } from "@nestjs/throttler";

@ApiTags('Bookings')
@Controller('flights/:flightId/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Get()
  async getBookingsForFlight(
    @Param('flightId', ParseIntPipe) flightId: number
  ) {
    return this.bookingsService.getBookingsForFlight(flightId)
  }

  @Get(':id')
  async getBookingById(@Param('id', ParseIntPipe) id: number): Promise<Booking> {
    const booking = await this.bookingsService.findOne(id);
    if (!booking) {
      throw new NotFoundException(`Booking ID ${id} not found.`)
    }
    return booking
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post()
  async createBooking(
    @Param('flightId', ParseIntPipe) flightId: number,
    @Body() dto: CreateBookingDTO
  ): Promise<Booking> {
    return this.bookingsService.createBooking(flightId, dto)
  }

  @Delete(':bookingId')
  @HttpCode(200)
  async cancelBooking(
    @Param('flightId', ParseIntPipe) flightId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number
  ): Promise<{ message: string }> {
    await this.bookingsService.cancelBooking(flightId, bookingId)
    return { message: 'Booking canceled successfully' }
  }

}