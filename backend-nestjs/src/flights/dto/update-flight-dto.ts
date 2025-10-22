import { IsString, IsInt, IsDateString, Matches, Min, Max, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateFlightDTO {
  @ApiProperty({
    example: 'JB-101',
    description: 'Flight Number, as letters JB, hyphen, and three digits',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]{3,8}$/i, { message: 'flight_number must be alphanumeric (e.g. JB-202) and between 3 and 8 characters' })
  flightNumber?: string;

  @ApiProperty({
    example: 'JFK',
    description: 'Airport Code',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3,4}$/i, { message: 'origin must be 34 uppercase letters (IATA/ICAO code)' })
  origin?: string;

  @ApiProperty({
    example: 'LAX',
    description: 'Airport Code',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3,4}$/i, { message: 'destination must be 34 uppercase letters (IATA/ICAO code)' })
  destination?: string

  @ApiProperty({
    example: '2025-03-15T14:00:00.000Z',
    description: 'UTC-Time for the flight departure',
    required: false
  })
  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @ApiProperty({
    example: '2025-03-15T18:00:00.000Z',
    description: 'UTC-Time for the flight arrival',
    required: false
  })
  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @ApiProperty({
    example: '200',
    description: 'Flight Capacity',
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(400)
  capacity?: number;

  @ApiProperty({
    example: 'Scheduled',
    description: 'Flight Status',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^(Scheduled|Delayed|Cancelled|Boarding|Departed|Arrived)$/i, { message: 'status must be one of: Scheduled, Delayed, Cancelled, Boarding, Departed, Arrived' })
  status?: string;
}
