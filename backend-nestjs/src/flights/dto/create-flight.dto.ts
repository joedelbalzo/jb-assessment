import { IsString, IsInt, IsDateString, Matches, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFlightDTO {
  @ApiProperty({
    example: 'JB-101',
    description: 'Flight Number, as letters JB, hyphen, and three digits'
  })
  @IsString()
  @Matches(/^[A-Z0-9-]+$/i, { message: 'flight_number must be alphanumeric (e.g. JB-202)' })
  flight_number: string;

  @ApiProperty({
    example: 'JFK',
    description: 'Airport Code'
  })
  @IsString()
  @Matches(/^[A-Z]{3,4}$/i, { message: 'origin must be 3–4 uppercase letters (IATA/ICAO code)' })
  origin: string;

  @ApiProperty({
    example: 'LAX',
    description: 'Airport Code'
  })
  @IsString()
  @Matches(/^[A-Z]{3,4}$/i, { message: 'destination must be 3–4 uppercase letters (IATA/ICAO code)' })
  destination: string

  @ApiProperty({
    example: '2025-03-15T14:00:00.000Z',
    description: 'UTC-Time for the flight departure'
  })
  @IsDateString()
  departure_time: string;

  @ApiProperty({
    example: '2025-03-15T18:00:00.000Z',
    description: 'UTC-Time for the flight departure'
  })
  @IsDateString()
  arrival_time: string;

  @ApiProperty({
    example: '200',
    description: 'Flight Capacity'
  })
  @IsInt()
  @Min(1)
  @Max(1000)
  capacity: number;

}