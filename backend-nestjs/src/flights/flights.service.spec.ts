import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Flight } from './flight.entity';
import { CreateFlightDTO } from './dto/create-flight.dto';

describe('FlightsService', () => {
  let service: FlightsService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        {
          provide: getRepositoryToken(Flight),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all flights', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
        { id: 2, flightNumber: 'JB-102', origin: 'BOS', destination: 'SFO' },
      ] as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.findAll();

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no flights exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single flight by id', async () => {
      const mockFlight = {
        id: 1,
        flightNumber: 'JB-101',
        origin: 'JFK',
        destination: 'LAX',
      };

      mockRepository.findOne.mockResolvedValue(mockFlight);

      const result = await service.findOne(1);

      expect(result).toEqual(mockFlight);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if flight not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('create', () => {
    it('should create a valid flight', async () => {
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
        ...dto,
        status: 'Scheduled',
      };

      mockRepository.findOne.mockResolvedValue(null); // No duplicate
      mockRepository.create.mockReturnValue(createdFlight);
      mockRepository.save.mockResolvedValue(createdFlight);

      const result = await service.create(dto);

      expect(result).toEqual(createdFlight);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        status: 'Scheduled',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdFlight);
    });

    it('should throw BadRequestException if arrivalTime is before departureTime', async () => {
      const dto: CreateFlightDTO = {
        flightNumber: 'JB-202',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '2025-03-15T14:00:00Z',
        arrivalTime: '2025-03-15T10:00:00Z', // Before departure
        capacity: 180,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('arrivalTime must be after departureTime');
    });

    it('should throw BadRequestException if arrivalTime equals departureTime', async () => {
      const dto: CreateFlightDTO = {
        flightNumber: 'JB-202',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '2025-03-15T10:00:00Z',
        arrivalTime: '2025-03-15T10:00:00Z', // Same as departure
        capacity: 180,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('arrivalTime must be after departureTime');
    });

    it('should throw BadRequestException if duplicate flight_number exists on same day', async () => {
      const dto: CreateFlightDTO = {
        flightNumber: 'JB-202',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '2025-03-15T10:00:00Z',
        arrivalTime: '2025-03-15T14:00:00Z',
        capacity: 180,
      };

      const existingFlight = {
        id: 1,
        flightNumber: 'JB-202',
        departureTime: new Date('2025-03-15T08:00:00Z'),
      };

      mockRepository.findOne.mockResolvedValue(existingFlight);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('already exists on 2025-03-15');
    });

    it('should allow same flight_number on different days', async () => {
      const dto: CreateFlightDTO = {
        flightNumber: 'JB-202',
        origin: 'JFK',
        destination: 'LAX',
        departureTime: '2025-03-16T10:00:00Z', // Different day
        arrivalTime: '2025-03-16T14:00:00Z',
        capacity: 180,
      };

      const createdFlight = {
        id: 2,
        ...dto,
        status: 'Scheduled',
      };

      mockRepository.findOne.mockResolvedValue(null); // No duplicate on this day
      mockRepository.create.mockReturnValue(createdFlight);
      mockRepository.save.mockResolvedValue(createdFlight);

      const result = await service.create(dto);

      expect(result).toEqual(createdFlight);
    });
  });

  describe('searchFlights', () => {
    it('should filter by origin', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
      ] as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.searchFlights('JFK');

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { origin: 'JFK' },
      });
    });

    it('should filter by destination', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
      ] as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.searchFlights(undefined, 'LAX');

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { destination: 'LAX' },
      });
    });

    it('should filter by date', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', departureTime: '2025-03-15T10:00:00Z' },
      ] as unknown as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.searchFlights(undefined, undefined, '2025-03-15');

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          departureTime: expect.any(Object), // Between object
        },
      });
    });

    it('should filter by flight_number', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', origin: 'JFK', destination: 'LAX' },
      ] as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.searchFlights(undefined, undefined, undefined, 'JB-101');

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { flightNumber: 'JB-101' },
      });
    });

    it('should filter by status', async () => {
      const mockFlights = [
        { id: 1, flightNumber: 'JB-101', status: 'Scheduled' },
      ] as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.searchFlights(undefined, undefined, undefined, undefined, 'Scheduled');

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: 'Scheduled' },
      });
    });

    it('should combine multiple filters', async () => {
      const mockFlights = [
        {
          id: 1,
          flightNumber: 'JB-101',
          origin: 'JFK',
          destination: 'LAX',
          status: 'Scheduled',
        },
      ] as Flight[];

      mockRepository.find.mockResolvedValue(mockFlights);

      const result = await service.searchFlights('JFK', 'LAX', undefined, undefined, 'Scheduled');

      expect(result).toEqual(mockFlights);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          origin: 'JFK',
          destination: 'LAX',
          status: 'Scheduled',
        },
      });
    });

    it('should return empty array when no flights match', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.searchFlights('JFK', 'LAX');

      expect(result).toEqual([]);
    });
  });
});
