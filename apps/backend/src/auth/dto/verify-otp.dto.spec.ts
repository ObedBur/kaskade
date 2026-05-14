import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { VerifyOtpDto } from './verify-otp.dto';

describe('VerifyOtpDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(VerifyOtpDto, { email: 'test@test.com', otp: '123456' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is invalid', async () => {
    const dto = plainToInstance(VerifyOtpDto, { email: 'invalid', otp: '123456' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if otp is too short', async () => {
    const dto = plainToInstance(VerifyOtpDto, { email: 'test@test.com', otp: '123' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'otp')).toBe(true);
  });

  it('should fail if otp is too long', async () => {
    const dto = plainToInstance(VerifyOtpDto, { email: 'test@test.com', otp: '1234567' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'otp')).toBe(true);
  });

  it('should fail if otp is empty', async () => {
    const dto = plainToInstance(VerifyOtpDto, { email: 'test@test.com', otp: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
