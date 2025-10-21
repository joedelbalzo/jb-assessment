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

    //very basic service validation -- does it depart before it arrives? does the flight number already exist today?
    const departure = new Date(dto.departureTime);
    const arrival = new Date(dto.arrivalTime);
    if (arrival <= departure) {
      throw new BadRequestException('arrivalTime must be after departureTime')
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
        flightNumber: dto.flightNumber,
        departureTime: Between(startOfDay, endOfDay),
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Flight number ${dto.flightNumber} already exists on ${departure.toISOString().split('T')[0]}.`,
      );
    }
    //end of very basic service validation


    const flight = this.flightRepo.create({
      ...dto, status: 'Scheduled',
    })
    return this.flightRepo.save(flight)
  }

  async searchFlights(origin?: string, destination?: string, date?: string, flightNumber?: string, status?: string): Promise<Flight[]> {

    const where: FindOptionsWhere<Flight> = {}
    if (origin) where.origin = origin
    if (destination) where.destination = destination
    if (flightNumber) where.flightNumber = flightNumber
    if (status) where.status = status

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      where.departureTime = Between(start, end)
    }


    return this.flightRepo.find({ where })
  }

}