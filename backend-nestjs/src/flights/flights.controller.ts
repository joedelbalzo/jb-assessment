import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FlightsService } from "./flights.service";
import { Flight } from "./flight.entity";
import { CreateFlightDTO } from "./dto/create-flight.dto";
import { SearchFlightsDTO } from "./dto/search-flight.dto";
import { Throttle } from "@nestjs/throttler";

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) { }

  @Get()
  async getFlights(@Query() query: SearchFlightsDTO): Promise<Flight[]> {
    const { origin, destination, date, flightNumber, status } = query
    if (origin || destination || date || flightNumber || status) {
      return this.flightsService.searchFlights(origin, destination, date, flightNumber, status);
    }
    return this.flightsService.findAll()
  }


  @Get(':id')
  async getFlightById(@Param('id', ParseIntPipe) id: number): Promise<Flight> {
    const flight = await this.flightsService.findOne(id);
    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }
    return flight;
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post()
  async createFlight(@Body() dto: CreateFlightDTO): Promise<Flight> {
    return this.flightsService.create(dto)
  }

}