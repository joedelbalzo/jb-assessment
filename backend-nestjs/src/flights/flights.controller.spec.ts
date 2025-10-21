import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { Flight } from './flight.entity';
import { CreateFlightDTO } from './dto/create-flight.dto';
import { SearchFlightsDTO } from './dto/search-flight.dto';

describe('FlightsController', () => {
  let controller: FlightsController;

  const mockFlightsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    searchFlights: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightsController],
      providers: [
        {
          provide: FlightsService,
          useValue: mockFlightsService,
        },
      ],
    }).compile();

    controller = module.get<FlightsController>(FlightsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFlights', () => {
    it('should call findAll when no query params provided', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
        { id: 2, flightNumber: 'JB-102', origin: 'BOS', destination: 'SFO' },
      ] as Flight[];

      mockFlightsService.findAll.mockResolvedValue(mockFlights);

      const query: SearchFlightsDTO = {};
      const result = await controller.getFlights(query);

      expect(result).toEqual(mockFlights);
      expect(mockFlightsService.findAll).toHaveBeenCalledTimes(1);
      expect(mockFlightsService.searchFlights).not.toHaveBeenCalled();
    });

    it('should call searchFlights when origin is provided', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
      ] as Flight[];

      mockFlightsService.searchFlights.mockResolvedValue(mockFlights);

      const query: SearchFlightsDTO = { origin: 'JFK' };
      const result = await controller.getFlights(query);

      expect(result).toEqual(mockFlights);
      expect(mockFlightsService.searchFlights).toHaveBeenCalledWith(
        'JFK',
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(mockFlightsService.findAll).not.toHaveBeenCalled();
    });

    it('should call searchFlights when destination is provided', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
      ] as Flight[];

      mockFlightsService.searchFlights.mockResolvedValue(mockFlights);

      const query: SearchFlightsDTO = { destination: 'LAX' };
      const result = await controller.getFlights(query);

      expect(result).toEqual(mockFlights);
      expect(mockFlightsService.searchFlights).toHaveBeenCalledWith(
        undefined,
        'LAX',
        undefined,
        undefined,
        undefined,
      );
    });

    it('should call searchFlights when date is provided', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', departureTime: new Date('2025-03-15') },
      ] as Flight[];

      mockFlightsService.searchFlights.mockResolvedValue(mockFlights);

      const query: SearchFlightsDTO = { date: '2025-03-15' };
      const result = await controller.getFlights(query);

      expect(result).toEqual(mockFlights);
      expect(mockFlightsService.searchFlights).toHaveBeenCalledWith(
        undefined,
        undefined,
        '2025-03-15',
        undefined,
        undefined,
      );
    });

    it('should call searchFlights with multiple query params', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
      ] as Flight[];

      mockFlightsService.searchFlights.mockResolvedValue(mockFlights);

      const query: SearchFlightsDTO = {
        origin: 'JFK',
        destination: 'LAX',
        date: '2025-03-15',
      };
      const result = await controller.getFlights(query);

      expect(result).toEqual(mockFlights);
      expect(mockFlightsService.searchFlights).toHaveBeenCalledWith(
        'JFK',
        'LAX',
        '2025-03-15',
        undefined,
        undefined,
      );
    });
  });

  describe('getFlightById', () => {
    it('should return flight when found', async () => {
      const mockFlight = {
        id: 1,
        flightNumber: 'JB-101',
        origin: 'JFK',
        destination: 'LAX',
      } as Flight;

      mockFlightsService.findOne.mockResolvedValue(mockFlight);

      const result = await controller.getFlightById(1);

      expect(result).toEqual(mockFlight);
      expect(mockFlightsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when flight not found', async () => {
      mockFlightsService.findOne.mockResolvedValue(null);

      await expect(controller.getFlightById(999)).rejects.toThrow(NotFoundException);
      await expect(controller.getFlightById(999)).rejects.toThrow('Flight with ID 999 not found');
    });
  });

  describe('createFlight', () => {
    it('should create and return a flight', async () => {
      const dto: CreateFlightDTO = {
        flightNumber: 'JB-202',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '2025-03-15T10:00:00Z',
        arrivalTime: '2025-03-15T14:00:00Z',
        capacity: 180,
      };

      const createdFlight = {
        id: 1,
        flightNumber: dto.flightNumber,
        origin: dto.origin,
        destination: dto.destination,
        departureTime: new Date(dto.departureTime),
        arrivalTime: new Date(dto.arrivalTime),
        capacity: dto.capacity,
        status: 'Scheduled',
        bookings: [],
      } as Flight;

      mockFlightsService.create.mockResolvedValue(createdFlight);

      const result = await controller.createFlight(dto);

      expect(result).toEqual(createdFlight);
      expect(mockFlightsService.create).toHaveBeenCalledWith(dto);
    });
  });
});
