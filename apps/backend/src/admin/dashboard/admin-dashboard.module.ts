import { Module } from '@nestjs/common';

/**
 * Stub module – la logique dashboard admin est dans AdminModule/AdminService.
 * Ce module existe pour satisfaire les imports existants le temps de refactorisation.
 */
@Module({})
export class AdminDashboardModule {}
