import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordDto } from './reset-password.dto';

describe('ResetPasswordDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'valid-reset-token',
      newPassword: 'NewPassword1!',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if token is empty', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: '',
      newPassword: 'NewPassword1!',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });

  it('should fail if newPassword is too short (< 8 chars)', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'valid-token',
      newPassword: 'Ab1!',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });

  it('should fail if newPassword is empty', async () => {
    const dto = plainToInstance(ResetPasswordDto, {
      token: 'valid-token',
      newPassword: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'newPassword')).toBe(true);
  });
});
