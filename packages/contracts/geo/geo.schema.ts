import { z } from 'zod';

// schemas

export const CreateRegionInputSchema = z.object({
  name: z.string().min(1),
});

export const UpdateRegionInputSchema = CreateRegionInputSchema.partial();

export const CreateDistrictInputSchema = z.object({
  name: z.string().min(1),
  regionId: z.string().uuid(),
});

export const UpdateDistrictInputSchema = CreateDistrictInputSchema.partial();

export const CreateSchoolInputSchema = z.object({
  name: z.string().min(1),
  regionId: z.string().uuid(),
  districtId: z.string().uuid(),
});

export const UpdateSchoolInputSchema = CreateSchoolInputSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// types

export type CreateRegionInput = z.infer<typeof CreateRegionInputSchema>;
export type UpdateRegionInput = z.infer<typeof UpdateRegionInputSchema>;
export type CreateDistrictInput = z.infer<typeof CreateDistrictInputSchema>;
export type UpdateDistrictInput = z.infer<typeof UpdateDistrictInputSchema>;
export type CreateSchoolInput = z.infer<typeof CreateSchoolInputSchema>;
export type UpdateSchoolInput = z.infer<typeof UpdateSchoolInputSchema>;

// interfaces

export interface RegionOutput {
  id: string;
  name: string;
}

export interface DistrictOutput {
  id: string;
  name: string;
  regionId: string;
}

export interface SchoolOutput {
  id: string;
  name: string;
  regionId: string;
  districtId: string;
  isActive?: boolean;
}
