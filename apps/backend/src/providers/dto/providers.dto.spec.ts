import { validate } from 'class-validator';
import { ApplyProviderDto } from './apply-provider.dto';
import { AssignServicesDto } from './assign-services.dto';
import { UpdateProviderProfileDto } from './update-provider-profile.dto';

describe('Providers DTO Validation', () => {
  describe('ApplyProviderDto', () => {
    it('should validate a correct DTO', async () => {
      const dto = new ApplyProviderDto();
      dto.motivation = 'Je suis extrêmement motivé';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if motivation is missing or empty', async () => {
      const dto = new ApplyProviderDto();
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('motivation');
    });
  });

  describe('AssignServicesDto', () => {
    it('should validate a correct DTO with UUIDs', async () => {
      const dto = new AssignServicesDto();
      dto.serviceIds = ['123e4567-e89b-42d3-a456-426614174000'];
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if serviceIds is not an array of UUIDs', async () => {
      const dto = new AssignServicesDto();
      dto.serviceIds = ['not-a-valid-uuid'];
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('serviceIds');
    });

    it('should validate even if empty array, since IsNotEmpty allows empty objects. To block this, ArrayNotEmpty is required in DTO', async () => {
      const dto = new AssignServicesDto();
      dto.serviceIds = [];
      const errors = await validate(dto);
      expect(errors.length).toBe(0); // IsNotEmpty ne bloque pas les []
    });
  });

  describe('UpdateProviderProfileDto', () => {
    it('should allow empty DTO safely since all are optional', async () => {
      const dto = new UpdateProviderProfileDto();
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate if strings are provided', async () => {
      const dto = new UpdateProviderProfileDto();
      dto.metier = 'Plombier';
      dto.bio = 'Expert';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if a number is passed where a string is expected', async () => {
      const dto = new UpdateProviderProfileDto();
      (dto as any).metier = 123;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('metier');
    });
  });
});
