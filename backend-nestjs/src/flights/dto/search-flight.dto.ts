import { IsString, Matches, IsOptional } from "class-validator";

export class SearchFlightsDTO {
  @IsOptional()
  @IsString({ message: 'origin must be a string' })
  @Matches(/^[A-Z]{3,4}$/i, { message: 'origin must be a valid 3-4 lettter IATA/ICAO airport code.' })
  origin?: string;

  @IsOptional()
  @IsString({ message: 'destination must be a string' })
  @Matches(/^[A-Z]{3,4}$/i, { message: 'destination must be a valid 3-4 lettter IATA/ICAO airport code.' })
  destination?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be yyyy-mm-dd format' })
  date?: string;

  @IsOptional()
  @Matches(/^[A-Z0-9-]{3,8}$/i, { message: 'flight_number must be alphanumeric (e.g., JB-202) and between 3 and 8 characters' })
  flightNumber?: string;

  @IsOptional()
  @IsString({ message: 'status must be a string' })
  @Matches(/^(Scheduled|Delayed|Canceled|Completed)$/i, {
    message: 'status must be one of Scheduled, Delayed, Canceled, or Completed',
  })
  status?: string;

}