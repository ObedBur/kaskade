import { validate } from 'class-validator';
import { CreateServiceDto } from './create-service.dto';
import { UpdateServiceDto } from './update-service.dto';

describe('Services DTO Validation', () => {
  describe('CreateServiceDto', () => {
    it('should validate a correct DTO', async () => {
      const dto = new CreateServiceDto();
      dto.name = 'Plomberie';
      dto.category = 'Bâtiment';
      dto.price = 50;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if name is missing', async () => {
      const dto = new CreateServiceDto();
      dto.category = 'Bâtiment';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail if name is too short (min 2)', async () => {
      const dto = new CreateServiceDto();
      dto.name = 'P';
      dto.category = 'Bâtiment';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail if category is missing', async () => {
      const dto = new CreateServiceDto();
      dto.name = 'Plomberie';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('category');
    });
  });

  describe('UpdateServiceDto', () => {
    it('should allow valid updates including isActive', async () => {
      const dto = new UpdateServiceDto();
      dto.isActive = false;
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail if isActive is not boolean', async () => {
      const dto = new UpdateServiceDto();
      (dto as any).isActive = 'yes';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('isActive');
    });
  });
});
