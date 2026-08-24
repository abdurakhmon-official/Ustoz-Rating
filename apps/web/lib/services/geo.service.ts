import type {
  CreateDistrictInput,
  CreateRegionInput,
  CreateSchoolInput,
  DistrictOutput,
  RegionOutput,
  SchoolOutput,
  UpdateDistrictInput,
  UpdateRegionInput,
  UpdateSchoolInput,
} from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class GeoService extends BaseService<never> {
  protected BASE_PATH = 'geo';

  async listRegions() {
    return this.sendGet<RegionOutput[]>('/regions');
  }

  async listDistricts(regionId: string) {
    return this.sendGet<DistrictOutput[]>(`/regions/${regionId}/districts`);
  }

  async listSchools(districtId: string) {
    return this.sendGet<SchoolOutput[]>(`/districts/${districtId}/schools`);
  }

  async createRegion(input: CreateRegionInput) {
    return this.sendPost<RegionOutput>('/regions', input);
  }

  async updateRegion(regionId: string, input: UpdateRegionInput) {
    return this.sendPatch<RegionOutput>(`/regions/${regionId}`, input);
  }

  async deleteRegion(regionId: string) {
    return this.sendDelete(`/regions/${regionId}`);
  }

  async createDistrict(input: CreateDistrictInput) {
    return this.sendPost<DistrictOutput>('/districts', input);
  }

  async updateDistrict(districtId: string, input: UpdateDistrictInput) {
    return this.sendPatch<DistrictOutput>(`/districts/${districtId}`, input);
  }

  async deleteDistrict(districtId: string) {
    return this.sendDelete(`/districts/${districtId}`);
  }

  async createSchool(input: CreateSchoolInput) {
    return this.sendPost<SchoolOutput>('/schools', input);
  }

  async updateSchool(schoolId: string, input: UpdateSchoolInput) {
    return this.sendPatch<SchoolOutput>(`/schools/${schoolId}`, input);
  }

  async deleteSchool(schoolId: string) {
    return this.sendDelete(`/schools/${schoolId}`);
  }
}

export const geoService = new GeoService();
