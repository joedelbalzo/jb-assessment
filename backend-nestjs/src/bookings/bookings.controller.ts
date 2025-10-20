import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { BookingsService } from "./bookings.service";
import { Booking } from "./booking.entity";

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Get()
  getAllBookings(): Promise<Booking[]> {
    return this.bookingsService.findAll()
  }
  @Get(':id')
  getBookingById(@Param('id', ParseIntPipe) id: number): Promise<Booking | null> {
    return this.bookingsService.findOne(id)
  }
}