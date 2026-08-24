import { Injectable } from '@tsed/di';
import type { SearchOutput, SearchResultItem } from '@repo/contracts';
import prisma from '@/modules/db';
import { USER_ROLE } from '../generated/prisma';

@Injectable()
export class SearchService {
  private static readonly LIMIT = 5;

  async search(q: string) {
    const contains = { contains: q, mode: 'insensitive' as const };

    const [teachers, schools, subjects, districts, regions] = await Promise.all([
      prisma.user.findMany({
        where: { role: USER_ROLE.TEACHER, active: true, deletedAt: null, fullName: contains },
        select: { id: true, fullName: true, subject: { select: { name: true } }, school: { select: { name: true } } },
        take: SearchService.LIMIT,
      }),
      prisma.school.findMany({
        where: { name: contains },
        select: { id: true, name: true, district: { select: { name: true } } },
        take: SearchService.LIMIT,
      }),
      prisma.subject.findMany({
        where: { name: contains, isActive: true },
        select: { id: true, name: true },
        take: SearchService.LIMIT,
      }),
      prisma.district.findMany({
        where: { name: contains },
        select: { id: true, name: true, region: { select: { name: true } } },
        take: SearchService.LIMIT,
      }),
      prisma.region.findMany({
        where: { name: contains },
        select: { id: true, name: true },
        take: SearchService.LIMIT,
      }),
    ]);

    const data: SearchOutput = {
      teachers: teachers.map(
        (teacher): SearchResultItem => ({
          id: teacher.id,
          label: teacher.fullName,
          description: [teacher.subject?.name, teacher.school?.name].filter(Boolean).join(' · ') || null,
        }),
      ),
      schools: schools.map((school): SearchResultItem => ({ id: school.id, label: school.name, description: school.district.name })),
      subjects: subjects.map((subject): SearchResultItem => ({ id: subject.id, label: subject.name, description: null })),
      districts: districts.map(
        (district): SearchResultItem => ({ id: district.id, label: district.name, description: district.region.name }),
      ),
      regions: regions.map((region): SearchResultItem => ({ id: region.id, label: region.name, description: null })),
    };

    return { success: true, data };
  }
}
