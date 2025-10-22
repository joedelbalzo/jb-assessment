import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, FindOptionsWhere } from "typeorm";
import { Flight } from "./flight.entity";
import { CreateFlightDTO } from "./dto/create-flight.dto";
import { UpdateFlightDTO } from "./dto/update-flight-dto";

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

    // Validate departure/arrival times and check for duplicate flight numbers on the same day
    // Note: This simplified approach does not take into consideration flight times. 
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

  async updateFlightStatus(status: string, flightId: number): Promise<Flight> {
    const flight = await this.flightRepo.findOne({ where: { id: flightId } })
    if (!flight) {
      throw new NotFoundException(`No flight with the id of ${flightId}`)
    }

    flight.status = status

    return this.flightRepo.save(flight)
  }

  async update(id: number, dto: UpdateFlightDTO): Promise<Flight> {
    const flight = await this.flightRepo.findOne({ where: { id } })
    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`)
    }

    // Validate departure/arrival times if both are being updated
    if (dto.departureTime || dto.arrivalTime) {
      const departure = dto.departureTime ? new Date(dto.departureTime) : new Date(flight.departureTime);
      const arrival = dto.arrivalTime ? new Date(dto.arrivalTime) : new Date(flight.arrivalTime);

      if (arrival <= departure) {
        throw new BadRequestException('arrivalTime must be after departureTime')
      }
    }

    // Check for duplicate flight numbers if flight number or departure time is being updated
    if (dto.flightNumber || dto.departureTime) {
      const flightNumber = dto.flightNumber || flight.flightNumber;
      const departureTime = dto.departureTime ? new Date(dto.departureTime) : new Date(flight.departureTime);

      const startOfDay = new Date(Date.UTC(
        departureTime.getUTCFullYear(),
        departureTime.getUTCMonth(),
        departureTime.getUTCDate()
      ));
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

      const existing = await this.flightRepo.findOne({
        where: {
          flightNumber: flightNumber,
          departureTime: Between(startOfDay, endOfDay),
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Flight number ${flightNumber} already exists on ${departureTime.toISOString().split('T')[0]}.`,
        );
      }
    }

    // Update only the fields that are provided
    Object.assign(flight, dto);

    return this.flightRepo.save(flight)
  }

}