import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FlightsService } from "./flights.service";
import { BookingsService } from "src/bookings/bookings.service";
import { CreateBookingDTO } from "src/bookings/dto/create-booking.dto";
import { Flight } from "./flight.entity";
import { Booking } from "src/bookings/booking.entity";
import { CreateFlightDTO } from "./dto/create-flight.dto";
import { SearchFlightsDTO } from "./dto/search-flight.dto";

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService, private readonly bookingsService: BookingsService) { }

  @Get()
  async getFlights(@Query() query: SearchFlightsDTO): Promise<Flight[]> {
    const { origin, destination, date, flight_number, status } = query
    if (origin || destination || date || flight_number || status) {
      return this.flightsService.searchFlights(origin, destination, date, flight_number, status);
    }
    return this.flightsService.findAll()
  }


  @Get(':id')
  getFlightById(@Param('id', ParseIntPipe) id: number): Promise<Flight | null> {
    return this.flightsService.findOne(id)
  }

  @Post()
  createFlight(@Body() dto: CreateFlightDTO): Promise<Flight> {
    return this.flightsService.create(dto)
  }

  @Get(':id/bookings')
  async getBookingsForFlight(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.bookingsService.getBookingsForFlight(id)
  }

  @Post(':id/bookings')
  async createBooking(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateBookingDTO,
  ): Promise<Booking> {
    return this.bookingsService.createBooking(id, dto)
  }

  @Delete(':flightId/bookings/:bookingId')
  @HttpCode(200)
  async cancelBooking(
    @Param('flightId', ParseIntPipe) flightId: number,
    @Param('bookingId', ParseIntPipe) bookingId: number
  ): Promise<{ message: string }> {
    await this.bookingsService.cancelBooking(flightId, bookingId)
    return { message: 'Booking canceled successfully' }
  }

}