import prisma from '@/modules/db';
import { badRequest } from '@/utils/errors.utils';

export const assertGeoConsistent = async (regionId: string, districtId: string, schoolId: string): Promise<void> => {
  const [district, school] = await Promise.all([
    prisma.district.findUnique({ where: { id: districtId }, select: { regionId: true } }),
    prisma.school.findUnique({ where: { id: schoolId }, select: { districtId: true, regionId: true } }),
  ]);

  if (!district || district.regionId !== regionId) {
    throw badRequest('GEO_DISTRICT_MISMATCH', 'the district does not belong to the selected region');
  }

  if (!school || school.districtId !== districtId || school.regionId !== regionId) {
    throw badRequest('GEO_SCHOOL_MISMATCH', 'the school does not belong to the selected district');
  }
};
