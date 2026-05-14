import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

// Mock du driver externe de Mails
const mockSendTransacEmail = jest.fn();
jest.mock('@getbrevo/brevo', () => {
  return {
    BrevoClient: jest.fn().mockImplementation(() => {
      return {
        transactionalEmails: {
          sendTransacEmail: mockSendTransacEmail,
        },
      };
    }),
  };
});

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('dummy_api_key'),
  get: jest.fn((key: string) => {
    if (key === 'FRONTEND_URL') return 'http://test';
    if (key === 'MAIL_FROM_EMAIL') return 'test@kaskade.com';
    if (key === 'MAIL_FROM_NAME') return 'Kaskade Team';
    return null;
  }),
};

describe('MailService', () => {
  let service: MailService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('sends email successfully', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: '123' });
      const res = await service.sendVerificationEmail('a@b.com', 'Test', '1234', 'PROVIDER');
      expect(res).toEqual({ messageId: '123' });
      expect(mockSendTransacEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Bienvenue chez Kaskade - Inscription Prestataire',
        })
      );
    });

    it('throws on error', async () => {
      mockSendTransacEmail.mockRejectedValue(new Error('fail'));
      await expect(service.sendVerificationEmail('a@b.com', 'Test', '1234', 'CLIENT'))
        .rejects.toThrow('fail');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('sends email successfully', async () => {
      mockSendTransacEmail.mockResolvedValue({ messageId: '456' });
      await service.sendPasswordResetEmail('a@b.com', 'Test', 'token');
      expect(mockSendTransacEmail).toHaveBeenCalled();
    });

    it('throws on error', async () => {
      mockSendTransacEmail.mockRejectedValue(new Error('fail'));
      await expect(service.sendPasswordResetEmail('a@b.com', 'Test', 'token'))
        .rejects.toThrow('fail');
    });
  });
});
