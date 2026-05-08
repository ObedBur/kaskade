import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ForgotPasswordDto } from './forgot-password.dto';

describe('ForgotPasswordDto', () => {
  it('should pass with valid email', async () => {
    const dto = plainToInstance(ForgotPasswordDto, { email: 'test@test.com' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is invalid', async () => {
    const dto = plainToInstance(ForgotPasswordDto, { email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if email is empty', async () => {
    const dto = plainToInstance(ForgotPasswordDto, { email: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
