import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass with valid data', async () => {
    const dto = plainToInstance(LoginDto, { email: 'test@test.com', password: 'Password123!' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is invalid', async () => {
    const dto = plainToInstance(LoginDto, { email: 'invalid', password: 'Password123!' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if email is empty', async () => {
    const dto = plainToInstance(LoginDto, { email: '', password: 'Password123!' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if password is empty', async () => {
    const dto = plainToInstance(LoginDto, { email: 'test@test.com', password: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
