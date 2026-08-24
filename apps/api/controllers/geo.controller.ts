import { Controller, Inject } from '@tsed/di';
import { BodyParams, PathParams } from '@tsed/platform-params';
import { Delete, Get, Patch, Post } from '@tsed/schema';
import {
  CreateDistrictInputSchema,
  CreateRegionInputSchema,
  CreateSchoolInputSchema,
  UpdateDistrictInputSchema,
  UpdateRegionInputSchema,
  UpdateSchoolInputSchema,
} from '@/inputs/geo.input';
import type {
  CreateDistrictInput,
  CreateRegionInput,
  CreateSchoolInput,
  UpdateDistrictInput,
  UpdateRegionInput,
  UpdateSchoolInput,
} from '@/inputs/geo.input';
import { AdminOnly, Authorized } from '@/middlewares/auth.middleware';
import { RATE_LIMITS, RateLimit } from '@/middlewares/rate-limit.middleware';
import { GeoService } from '@/services/geo.service';

@Controller('/geo')
export class GeoController {
  @Inject()
  private geoService!: GeoService;

  @Get('/regions')
  async listRegions() {
    return this.geoService.listRegions();
  }

  @Get('/regions/:regionId/districts')
  async listDistricts(@PathParams('regionId') regionId: string) {
    return this.geoService.listDistricts(regionId);
  }

  @Get('/districts/:districtId/schools')
  async listSchools(@PathParams('districtId') districtId: string) {
    return this.geoService.listSchools(districtId);
  }

  @Post('/regions')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createRegion(@BodyParams() body: CreateRegionInput) {
    return this.geoService.createRegion(CreateRegionInputSchema.parse(body));
  }

  @Patch('/regions/:regionId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateRegion(@PathParams('regionId') regionId: string, @BodyParams() body: UpdateRegionInput) {
    return this.geoService.updateRegion(regionId, UpdateRegionInputSchema.parse(body));
  }

  @Delete('/regions/:regionId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteRegion(@PathParams('regionId') regionId: string) {
    return this.geoService.deleteRegion(regionId);
  }

  @Post('/districts')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createDistrict(@BodyParams() body: CreateDistrictInput) {
    return this.geoService.createDistrict(CreateDistrictInputSchema.parse(body));
  }

  @Patch('/districts/:districtId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateDistrict(@PathParams('districtId') districtId: string, @BodyParams() body: UpdateDistrictInput) {
    return this.geoService.updateDistrict(districtId, UpdateDistrictInputSchema.parse(body));
  }

  @Delete('/districts/:districtId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteDistrict(@PathParams('districtId') districtId: string) {
    return this.geoService.deleteDistrict(districtId);
  }

  @Post('/schools')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async createSchool(@BodyParams() body: CreateSchoolInput) {
    return this.geoService.createSchool(CreateSchoolInputSchema.parse(body));
  }

  @Patch('/schools/:schoolId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async updateSchool(@PathParams('schoolId') schoolId: string, @BodyParams() body: UpdateSchoolInput) {
    return this.geoService.updateSchool(schoolId, UpdateSchoolInputSchema.parse(body));
  }

  @Delete('/schools/:schoolId')
  @Authorized(AdminOnly())
  @RateLimit(RATE_LIMITS.admin)
  async deleteSchool(@PathParams('schoolId') schoolId: string) {
    return this.geoService.deleteSchool(schoolId);
  }
}
