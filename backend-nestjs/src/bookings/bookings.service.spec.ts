import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.entity';
import { Flight } from '../flights/flight.entity';
import { CreateBookingDTO } from './dto/create-booking.dto';

describe('BookingsService', () => {
  let service: BookingsService;

  const mockBookingRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  const mockFlightRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(Flight),
          useValue: mockFlightRepository,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all bookings', async () => {
      const mockBookings = [
        { id: 1, flightId: 1, passengerName: 'John Doe', seatClass: 'Economy' },
        { id: 2, flightId: 2, passengerName: 'Jane Smith', seatClass: 'Business' },
      ] as Booking[];

      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.findAll();

      expect(result).toEqual(mockBookings);
      expect(mockBookingRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no bookings exist', async () => {
      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single booking by id', async () => {
      const mockBooking = {
        id: 1,
        flightId: 1,
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBooking);
      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('getBookingsForFlight', () => {
    it('should return bookings for a flight', async () => {
      const mockBookings = [
        { id: 1, flightId: 1, passengerName: 'John Doe' },
        { id: 2, flightId: 1, passengerName: 'Jane Smith' },
      ] as Booking[];

      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.getBookingsForFlight(1);

      expect(result).toEqual(mockBookings);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: { flightId: 1 },
        order: { id: 'ASC' },
      });
    });

    it('should return empty array if no bookings found', async () => {
      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.getBookingsForFlight(1);

      expect(result).toEqual([]);
    });
  });

  describe('createBooking', () => {
    it('should create booking if flight exists and has capacity', async () => {
      const dto: CreateBookingDTO = {
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      const mockFlight = {
        id: 1,
        flightNumber: 'JB-101',
        capacity: 180,
      };

      const createdBooking = {
        id: 1,
        flightId: 1,
        ...dto,
        status: 'Confirmed',
      };

      mockFlightRepository.findOne.mockResolvedValue(mockFlight);
      mockBookingRepository.count.mockResolvedValue(50); // 50 confirmed bookings
      mockBookingRepository.create.mockReturnValue(createdBooking);
      mockBookingRepository.save.mockResolvedValue(createdBooking);

      const result = await service.createBooking(1, dto);

      expect(result).toEqual(createdBooking);
      expect(mockFlightRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockBookingRepository.count).toHaveBeenCalledWith({
        where: { flightId: 1, status: 'Confirmed' },
      });
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...dto,
        flightId: 1,
        status: 'Confirmed',
      });
    });

    it('should throw NotFoundException if flight does not exist', async () => {
      const dto: CreateBookingDTO = {
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      mockFlightRepository.findOne.mockResolvedValue(null);

      await expect(service.createBooking(999, dto)).rejects.toThrow(NotFoundException);
      await expect(service.createBooking(999, dto)).rejects.toThrow('Flight ID 999 not found');
    });

    it('should throw BadRequestException if flight is at full capacity', async () => {
      const dto: CreateBookingDTO = {
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      const mockFlight = {
        id: 1,
        flightNumber: 'JB-101',
        capacity: 180,
      };

      mockFlightRepository.findOne.mockResolvedValue(mockFlight);
      mockBookingRepository.count.mockResolvedValue(180); // Full capacity

      await expect(service.createBooking(1, dto)).rejects.toThrow(BadRequestException);
      await expect(service.createBooking(1, dto)).rejects.toThrow('Flight 1 is at full capacity');
    });

    it('should throw BadRequestException if flight capacity is exceeded', async () => {
      const dto: CreateBookingDTO = {
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      const mockFlight = {
        id: 1,
        flightNumber: 'JB-101',
        capacity: 100,
      };

      mockFlightRepository.findOne.mockResolvedValue(mockFlight);
      mockBookingRepository.count.mockResolvedValue(100); // At capacity

      await expect(service.createBooking(1, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelBooking', () => {
    it('should delete booking if it exists', async () => {
      const mockBooking = {
        id: 1,
        flightId: 1,
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.remove.mockResolvedValue(mockBooking);

      await service.cancelBooking(1, 1);

      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, flightId: 1 },
      });
      expect(mockBookingRepository.remove).toHaveBeenCalledWith(mockBooking);
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelBooking(1, 999)).rejects.toThrow(NotFoundException);
      await expect(service.cancelBooking(1, 999)).rejects.toThrow(
        'Booking ID 999 on flight 1 not found',
      );
    });

    it('should throw NotFoundException if booking exists but for different flight', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.cancelBooking(2, 1)).rejects.toThrow(NotFoundException);
      await expect(service.cancelBooking(2, 1)).rejects.toThrow(
        'Booking ID 1 on flight 2 not found',
      );
    });
  });
});
