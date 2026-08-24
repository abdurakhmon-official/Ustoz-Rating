'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateDistrictInput, CreateRegionInput, CreateSchoolInput, UpdateDistrictInput, UpdateRegionInput, UpdateSchoolInput } from '@repo/contracts';
import { queryKeys } from '@/lib/query-keys';
import { geoService } from '@/lib/services';

export const useRegions = () => {
  return useQuery({
    queryKey: queryKeys.regions,
    queryFn: () => geoService.listRegions(),
    staleTime: 60 * 60_000,
  });
};

export const useDistricts = (regionId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.districts(regionId ?? ''),
    queryFn: () => geoService.listDistricts(regionId as string),
    enabled: Boolean(regionId),
    staleTime: 60 * 60_000,
  });
};

export const useSchools = (districtId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.schools(districtId ?? ''),
    queryFn: () => geoService.listSchools(districtId as string),
    enabled: Boolean(districtId),
    staleTime: 60 * 60_000,
  });
};

export const useCreateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRegionInput) => geoService.createRegion(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.regions }),
  });
};

export const useUpdateRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ regionId, input }: { regionId: string; input: UpdateRegionInput }) => geoService.updateRegion(regionId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.regions }),
  });
};

export const useDeleteRegion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (regionId: string) => geoService.deleteRegion(regionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.regions }),
  });
};

export const useCreateDistrict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDistrictInput) => geoService.createDistrict(input),
    onSuccess: (district) => queryClient.invalidateQueries({ queryKey: queryKeys.districts(district.regionId) }),
  });
};

export const useUpdateDistrict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ districtId, input }: { districtId: string; input: UpdateDistrictInput }) => geoService.updateDistrict(districtId, input),
    onSuccess: (district) => queryClient.invalidateQueries({ queryKey: queryKeys.districts(district.regionId) }),
  });
};

export const useDeleteDistrict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ districtId }: { districtId: string; regionId: string }) => geoService.deleteDistrict(districtId),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: queryKeys.districts(variables.regionId) }),
  });
};

export const useCreateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchoolInput) => geoService.createSchool(input),
    onSuccess: (school) => queryClient.invalidateQueries({ queryKey: queryKeys.schools(school.districtId) }),
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId, input }: { schoolId: string; input: UpdateSchoolInput }) => geoService.updateSchool(schoolId, input),
    onSuccess: (school) => queryClient.invalidateQueries({ queryKey: queryKeys.schools(school.districtId) }),
  });
};

export const useDeleteSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ schoolId }: { schoolId: string; districtId: string }) => geoService.deleteSchool(schoolId),
    onSuccess: (_data, variables) => queryClient.invalidateQueries({ queryKey: queryKeys.schools(variables.districtId) }),
  });
};
