import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;
  let mockGetResponse: jest.Mock;
  let mockHttpArgumentsHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
    
    mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
    };
  });

  const getMockHost = () => ({
    switchToHttp: () => mockHttpArgumentsHost,
  } as unknown as ArgumentsHost);

  it('handles HttpException with string response', () => {
    const error = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    filter.catch(error, getMockHost());

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Bad Request',
    }));
  });

  it('handles HttpException with object response', () => {
    const error = new HttpException({ message: 'Validation Failed' }, HttpStatus.UNPROCESSABLE_ENTITY);
    filter.catch(error, getMockHost());

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Validation Failed',
    }));
  });

  it('handles Prisma P2002 (conflict error)', () => {
    const error = new Prisma.PrismaClientKnownRequestError('', { code: 'P2002', clientVersion: 'test' });
    filter.catch(error, getMockHost());

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Cette ressource existe déjà',
    }));
  });

  it('handles Prisma P2025 (not found error)', () => {
    const error = new Prisma.PrismaClientKnownRequestError('', { code: 'P2025', clientVersion: 'test' });
    filter.catch(error, getMockHost());

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Ressource non trouvée',
    }));
  });

  it('handles other unknown Prisma errors natively (Internal server error)', () => {
    const error = new Prisma.PrismaClientKnownRequestError('Random message', { code: 'P9999', clientVersion: 'test' });
    filter.catch(error, getMockHost());

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Erreur interne du serveur',
    }));
  });

  it('handles completely unhandled JS internal errors', () => {
    const error = new Error('Random JS crash at runtime');
    filter.catch(error, getMockHost());

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Erreur interne du serveur',
      statusCode: 500,
    }));
  });
});
