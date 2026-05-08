import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { Role } from '@prisma/client';

describe('Users DTO Validation', () => {
  describe('CreateUserDto', () => {
    it('should validate a correct DTO', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';
      dto.fullName = 'Test User';
      dto.phone = '1234567890';
      dto.quartier = 'Centre';
      dto.role = Role.CLIENT;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if email is invalid', async () => {
      const dto = new CreateUserDto();
      dto.email = 'not-an-email';
      dto.password = 'password123';
      dto.fullName = 'Test User';
      dto.phone = '1234567890';
      dto.quartier = 'Centre';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail if password is too short', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'short'; // less than 8 chars
      dto.fullName = 'Test User';
      dto.phone = '1234567890';
      dto.quartier = 'Centre';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail if required fields are missing', async () => {
      const dto = new CreateUserDto(); // empty
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateUserDto', () => {
    it('should allow empty DTO safely since all are optional', async () => {
      const dto = new UpdateUserDto();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if email is present but invalid', async () => {
      const dto = new UpdateUserDto();
      dto.email = 'invalid-email';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail if isActive is provided but not boolean', async () => {
      const dto = new UpdateUserDto();
      (dto as any).isActive = 'yes'; // invalid boolean

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isActive');
    });
  });
});
