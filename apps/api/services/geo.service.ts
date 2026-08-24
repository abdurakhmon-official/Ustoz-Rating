import { Inject, Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { badRequest, conflict, notFound } from '@/utils/errors.utils';
import { AuditService } from '@/services/audit.service';
import type { CreateDistrictInput, CreateRegionInput, CreateSchoolInput, UpdateDistrictInput, UpdateRegionInput, UpdateSchoolInput } from '@/inputs/geo.input';

@Injectable()
export class GeoService {
  @Inject()
  private auditService!: AuditService;

  async listRegions() {
    const regions = await prisma.region.findMany({
      select: { id: true, name: true },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: regions };
  }

  async listDistricts(regionId: string) {
    const districts = await prisma.district.findMany({
      where: { regionId },
      select: { id: true, name: true, regionId: true },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: districts };
  }

  async listSchools(districtId: string) {
    const schools = await prisma.school.findMany({
      where: { districtId, isActive: true },
      select: { id: true, name: true, regionId: true, districtId: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: schools };
  }

  async createRegion(input: CreateRegionInput) {
    const existing = await prisma.region.findUnique({ where: { name: input.name } });
    if (existing) throw conflict('REGION_NAME_TAKEN', 'a region with this name already exists');

    const region = await prisma.region.create({ data: { name: input.name } });
    await this.auditService.log('CREATE', 'Region', region.id, undefined, region);

    return { success: true, data: region };
  }

  async updateRegion(regionId: string, input: UpdateRegionInput) {
    const before = await prisma.region.findUnique({ where: { id: regionId } });
    if (!before) throw notFound('REGION_NOT_FOUND', 'region not found');

    const region = await prisma.region.update({ where: { id: regionId }, data: input });
    await this.auditService.log('UPDATE', 'Region', regionId, before, region);

    return { success: true, data: region };
  }

  async deleteRegion(regionId: string) {
    const before = await prisma.region.findUnique({ where: { id: regionId } });
    if (!before) throw notFound('REGION_NOT_FOUND', 'region not found');

    const usersInRegion = await prisma.user.count({ where: { regionId } });
    if (usersInRegion > 0) throw badRequest('REGION_IN_USE', 'a region with registered teachers cannot be deleted');

    await prisma.region.delete({ where: { id: regionId } });
    await this.auditService.log('DELETE', 'Region', regionId, before, undefined);

    return { success: true, data: null };
  }

  async createDistrict(input: CreateDistrictInput) {
    await this.assertRegionExists(input.regionId);

    const existing = await prisma.district.findUnique({
      where: { regionId_name: { regionId: input.regionId, name: input.name } },
    });
    if (existing) throw conflict('DISTRICT_NAME_TAKEN', 'a district with this name already exists in this region');

    const district = await prisma.district.create({ data: input });
    await this.auditService.log('CREATE', 'District', district.id, undefined, district);

    return { success: true, data: district };
  }

  async updateDistrict(districtId: string, input: UpdateDistrictInput) {
    const before = await prisma.district.findUnique({ where: { id: districtId } });
    if (!before) throw notFound('DISTRICT_NOT_FOUND', 'district not found');

    if (input.regionId) await this.assertRegionExists(input.regionId);

    const district = await prisma.district.update({ where: { id: districtId }, data: input });
    await this.auditService.log('UPDATE', 'District', districtId, before, district);

    return { success: true, data: district };
  }

  async deleteDistrict(districtId: string) {
    const before = await prisma.district.findUnique({ where: { id: districtId } });
    if (!before) throw notFound('DISTRICT_NOT_FOUND', 'district not found');

    const usersInDistrict = await prisma.user.count({ where: { districtId } });
    if (usersInDistrict > 0) throw badRequest('DISTRICT_IN_USE', 'a district with registered teachers cannot be deleted');

    await prisma.district.delete({ where: { id: districtId } });
    await this.auditService.log('DELETE', 'District', districtId, before, undefined);

    return { success: true, data: null };
  }

  async createSchool(input: CreateSchoolInput) {
    await this.assertDistrictBelongsToRegion(input.districtId, input.regionId);

    const existing = await prisma.school.findUnique({
      where: { districtId_name: { districtId: input.districtId, name: input.name } },
    });
    if (existing) throw conflict('SCHOOL_NAME_TAKEN', 'a school with this name already exists in this district');

    const school = await prisma.school.create({ data: input });
    await this.auditService.log('CREATE', 'School', school.id, undefined, school);

    return { success: true, data: school };
  }

  async updateSchool(schoolId: string, input: UpdateSchoolInput) {
    const before = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!before) throw notFound('SCHOOL_NOT_FOUND', 'school not found');

    if (input.districtId && input.regionId) {
      await this.assertDistrictBelongsToRegion(input.districtId, input.regionId);
    }

    const school = await prisma.school.update({ where: { id: schoolId }, data: input });
    await this.auditService.log('UPDATE', 'School', schoolId, before, school);

    return { success: true, data: school };
  }

  async deleteSchool(schoolId: string) {
    const before = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!before) throw notFound('SCHOOL_NOT_FOUND', 'school not found');

    await prisma.school.update({ where: { id: schoolId }, data: { isActive: false } });
    await this.auditService.log('DEACTIVATE', 'School', schoolId, before, { isActive: false });

    return { success: true, data: null };
  }

  private async assertRegionExists(regionId: string): Promise<void> {
    const region = await prisma.region.findUnique({ where: { id: regionId }, select: { id: true } });
    if (!region) throw notFound('REGION_NOT_FOUND', 'region not found');
  }

  private async assertDistrictBelongsToRegion(districtId: string, regionId: string): Promise<void> {
    const district = await prisma.district.findUnique({ where: { id: districtId }, select: { regionId: true } });
    if (!district) throw notFound('DISTRICT_NOT_FOUND', 'district not found');
    if (district.regionId !== regionId) throw badRequest('GEO_DISTRICT_MISMATCH', 'the district does not belong to the selected region');
  }
}
