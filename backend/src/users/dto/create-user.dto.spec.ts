import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  const validDto = {
    email: 'test@test.com',
    password: 'Password1!',
    fullName: 'Test User',
    phone: '0970000000',
    quartier: 'Goma',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateUserDto, validDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is invalid', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, email: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if email is empty', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, email: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if password is too short (< 8 chars)', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, password: 'Ab1' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail if password has no uppercase letter', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, password: 'password1!' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail if password has no lowercase letter', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, password: 'PASSWORD1!' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail if password has no digit', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, password: 'Password!' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('should fail if fullName is empty', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, fullName: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'fullName')).toBe(true);
  });

  it('should fail if phone is empty', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, phone: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('should fail if quartier is empty', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, quartier: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'quartier')).toBe(true);
  });

  it('should accept optional role field', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, role: 'CLIENT' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if role is invalid enum value', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, role: 'INVALID_ROLE' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('should accept optional metier field', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, metier: 'Plombier' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept optional experience field', async () => {
    const dto = plainToInstance(CreateUserDto, { ...validDto, experience: '5 ans' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
