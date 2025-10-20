import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { Flight } from "./flight.entity";
import { CreateFlightDTO } from "./dto/create-flight.dto";

@Injectable()
export class FlightsService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<Flight>,
  ) { }

  async findAll(): Promise<Flight[]> {
    return this.flightRepo.find();
  }

  async findOne(id: number): Promise<Flight | null> {
    return this.flightRepo.findOne({ where: { id } })
  }

  async create(dto: CreateFlightDTO): Promise<Flight> {
    //run very basic service validation -- does it depart before it arrives? does the flight number already exist today?
    const departure = new Date(dto.departure_time);
    const arrival = new Date(dto.arrival_time);
    if (arrival <= departure) {
      throw new BadRequestException('arrival_time must be after departure_time')
    }

    const startOfDay = new Date(Date.UTC(
      departure.getUTCFullYear(),
      departure.getUTCMonth(),
      departure.getUTCDate()
    ));
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

    const existing = await this.flightRepo.findOne({
      where: {
        flight_number: dto.flight_number,
        departure_time: Between(startOfDay, endOfDay),
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Flight number ${dto.flight_number} already exists on ${departure.toISOString().split('T')[0]}.`,
      );
    }


    const flight = this.flightRepo.create({
      ...dto, status: 'Scheduled',
    })
    return this.flightRepo.save(flight)
  }

  async searchFlights(origin?: string, destination?: string, date?: string, flight_number?: string, status?: string): Promise<Flight[]> {

    const where: FindOptionsWhere<Flight> = {}
    if (origin) where.origin = origin
    if (destination) where.destination = destination
    if (flight_number) where.flight_number = flight_number
    if (status) where.status = status

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      where.departure_time = Between(start, end)
    }


    return this.flightRepo.find({ where })
  }

}