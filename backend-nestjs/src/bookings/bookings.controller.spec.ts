import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.entity';
import { CreateBookingDTO } from './dto/create-booking.dto';

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBookingsService = {
    findOne: jest.fn(),
    getBookingsForFlight: jest.fn(),
    createBooking: jest.fn(),
    cancelBooking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBookingsForFlight', () => {
    it('should return bookings for a flight', async () => {
      const mockBookings = [
        { id: 1, flightId: 1, passengerName: 'John Doe', seatClass: 'Economy' },
        { id: 2, flightId: 1, passengerName: 'Jane Smith', seatClass: 'Business' },
      ] as Booking[];

      mockBookingsService.getBookingsForFlight.mockResolvedValue(mockBookings);

      const result = await controller.getBookingsForFlight(1);

      expect(result).toEqual(mockBookings);
      expect(mockBookingsService.getBookingsForFlight).toHaveBeenCalledWith(1);
    });

    it('should return empty array when no bookings found', async () => {
      mockBookingsService.getBookingsForFlight.mockResolvedValue([]);

      const result = await controller.getBookingsForFlight(1);

      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    it('should return booking when found', async () => {
      const mockBooking = {
        id: 1,
        flightId: 1,
        passengerName: 'John Doe',
        seatClass: 'Economy',
      } as Booking;

      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.getBookingById(1);

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingsService.findOne.mockResolvedValue(null);

      await expect(controller.getBookingById(999)).rejects.toThrow(NotFoundException);
      await expect(controller.getBookingById(999)).rejects.toThrow('Booking ID 999 not found');
    });
  });

  describe('createBooking', () => {
    it('should create and return a booking', async () => {
      const dto: CreateBookingDTO = {
        passengerName: 'John Doe',
        seatClass: 'Economy',
      };

      const createdBooking = {
        id: 1,
        flightId: 1,
        ...dto,
        status: 'Confirmed',
      } as Booking;

      mockBookingsService.createBooking.mockResolvedValue(createdBooking);

      const result = await controller.createBooking(1, dto);

      expect(result).toEqual(createdBooking);
      expect(mockBookingsService.createBooking).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('cancelBookings', () => {
    it('should cancel booking and return success message', async () => {
      mockBookingsService.cancelBooking.mockResolvedValue(undefined);

      const result = await controller.cancelBookings(1, 1);

      expect(result).toEqual({ message: 'Booking canceled successfully' });
      expect(mockBookingsService.cancelBooking).toHaveBeenCalledWith(1, 1);
    });

    it('should propagate NotFoundException from service', async () => {
      mockBookingsService.cancelBooking.mockRejectedValue(
        new NotFoundException('Booking ID 999 on flight 1 not found'),
      );

      await expect(controller.cancelBookings(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
