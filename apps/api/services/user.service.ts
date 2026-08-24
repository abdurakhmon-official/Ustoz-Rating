import { Inject, Injectable, InjectContext } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import { AdminUserQuerySchema } from '@repo/contracts';
import prisma from '@/modules/db';
import { hashPassword } from '@/modules/auth';
import { badRequest, conflict, notFound, requireUserId } from '@/utils/errors.utils';
import { uz } from '@/i18n/messages/uz.messages';
import { assertGeoConsistent } from '@/utils/geo-consistency.utils';
import { USER_PUBLIC_SELECT } from '@/utils/constants';
import { AuditService } from '@/services/audit.service';
import type { AdminCreateUserInput, AdminUpdateUserInput, SetActiveInput, UpdateProfileInput, UpdateRoleInput } from '@/inputs/user.input';
import { USER_ROLE } from '../generated/prisma';

@Injectable()
export class UserService {
  private static readonly SELECT = { id: true, fullName: true };

  private static readonly LIST_SELECT = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    active: true,
    emailVerified: true,
    createdAt: true,
    subject: { select: { name: true } },
    school: { select: { name: true } },
    region: { select: { name: true } },
  };

  private static readonly DETAIL_SELECT = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    active: true,
    emailVerified: true,
    phone: true,
    gender: true,
    avatar: true,
    position: true,
    experienceYears: true,
    createdAt: true,
    region: { select: { id: true, name: true } },
    district: { select: { id: true, name: true } },
    school: { select: { id: true, name: true } },
    subject: { select: { id: true, name: true } },
  };

  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private auditService!: AuditService;

  private get user() {
    return this.context.getRequest<Request>().user;
  }

  private get currentUserId(): string {
    return requireUserId(this.user);
  }

  async getById(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: UserService.SELECT });
    if (!user) throw notFound('AUTH_USER_NOT_FOUND', 'user not found');

    return user;
  }

  async updateSelf(input: UpdateProfileInput) {
    const userId = this.currentUserId;

    await this.assertGeoComplete(userId, input);

    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: USER_PUBLIC_SELECT,
    });

    return {
      success: true,
      _code: 'PROFILE_UPDATED',
      _message: uz.PROFILE_UPDATED,
      data: { ...user, isAdmin: user.role === USER_ROLE.ADMIN },
    };
  }

  async countByRole() {
    const grouped = await prisma.user.groupBy({ by: ['role'], _count: true });
    const countOf = (role: keyof typeof USER_ROLE) => grouped.find((group) => group.role === USER_ROLE[role])?._count ?? 0;

    return {
      total: grouped.reduce((sum, group) => sum + group._count, 0),
      teachers: countOf('TEACHER'),
      admins: countOf('ADMIN'),
    };
  }

  async list(rawQuery: unknown) {
    const { role, search, regionId, districtId, schoolId, subjectId, page, size } = AdminUserQuerySchema.parse(rawQuery);

    const where = {
      ...(role ? { role } : {}),
      ...(regionId ? { regionId } : {}),
      ...(districtId ? { districtId } : {}),
      ...(schoolId ? { schoolId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: UserService.LIST_SELECT,
        skip: (page - 1) * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        active: user.active,
        emailVerified: user.emailVerified,
        subjectName: user.subject?.name ?? null,
        schoolName: user.school?.name ?? null,
        regionName: user.region?.name ?? null,
        createdAt: user.createdAt.toISOString(),
      })),
      meta: { page, limit: size, total },
    };
  }

  async adminGet(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: UserService.DETAIL_SELECT });
    if (!user) throw notFound('AUTH_USER_NOT_FOUND', 'user not found');

    return { success: true, data: this.toDetail(user) };
  }

  async adminCreate(input: AdminCreateUserInput) {
    const email = input.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badRequest('AUTH_EMAIL_TAKEN', 'This email is already registered');

    if (input.regionId && input.districtId && input.schoolId) {
      await assertGeoConsistent(input.regionId, input.districtId, input.schoolId);
    }

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email,
        password: await hashPassword(input.password),
        role: input.role,
        phone: input.phone,
        gender: input.gender,
        regionId: input.regionId,
        districtId: input.districtId,
        schoolId: input.schoolId,
        subjectId: input.subjectId,
        position: input.position,
        experienceYears: input.experienceYears,
        emailVerified: true,
      },
      select: UserService.DETAIL_SELECT,
    });

    await this.auditService.log('CREATE', 'User', user.id, undefined, { email, role: input.role });

    return { success: true, data: this.toDetail(user) };
  }

  async adminUpdate(userId: string, input: AdminUpdateUserInput) {
    const before = await prisma.user.findUnique({ where: { id: userId }, select: UserService.DETAIL_SELECT });
    if (!before) throw notFound('AUTH_USER_NOT_FOUND', 'user not found');

    if (input.email && input.email.toLowerCase() !== before.email) {
      const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
      if (existing) throw conflict('AUTH_EMAIL_TAKEN', 'This email is already registered');
    }

    await this.assertGeoComplete(userId, input);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { ...input, email: input.email?.toLowerCase() },
      select: UserService.DETAIL_SELECT,
    });

    await this.auditService.log('UPDATE', 'User', userId, { email: before.email }, { email: user.email });

    return { success: true, data: this.toDetail(user) };
  }

  async updateRole(userId: string, input: UpdateRoleInput) {
    this.assertNotSelf(userId);
    const before = await this.findOrThrow(userId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: input.role },
      select: { id: true, fullName: true, email: true, role: true, active: true, emailVerified: true, createdAt: true },
    });

    await this.auditService.log('UPDATE_ROLE', 'User', userId, { role: before.role }, { role: user.role });

    return { success: true, data: { ...user, createdAt: user.createdAt.toISOString() } };
  }

  async setActive(userId: string, input: SetActiveInput) {
    this.assertNotSelf(userId);
    const before = await this.findOrThrow(userId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { active: input.active },
      select: { id: true, fullName: true, email: true, role: true, active: true, emailVerified: true, createdAt: true },
    });

    await this.auditService.log(input.active ? 'ACTIVATE' : 'DEACTIVATE', 'User', userId, { active: before.active }, { active: user.active });

    return { success: true, data: { ...user, createdAt: user.createdAt.toISOString() } };
  }

  async softDelete(userId: string) {
    this.assertNotSelf(userId);
    await this.findOrThrow(userId);

    await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date(), active: false } });
    await this.auditService.log('DELETE', 'User', userId, undefined, undefined);

    return { success: true, data: null };
  }

  private toDetail(user: {
    id: string;
    fullName: string;
    email: string;
    role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
    active: boolean;
    emailVerified: boolean;
    phone: string | null;
    gender: string | null;
    avatar: string | null;
    position: string | null;
    experienceYears: number | null;
    createdAt: Date;
    region: { id: string; name: string } | null;
    district: { id: string; name: string } | null;
    school: { id: string; name: string } | null;
    subject: { id: string; name: string } | null;
  }) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      active: user.active,
      emailVerified: user.emailVerified,
      phone: user.phone,
      gender: user.gender,
      avatar: user.avatar,
      regionId: user.region?.id ?? null,
      regionName: user.region?.name ?? null,
      districtId: user.district?.id ?? null,
      districtName: user.district?.name ?? null,
      schoolId: user.school?.id ?? null,
      schoolName: user.school?.name ?? null,
      subjectId: user.subject?.id ?? null,
      subjectName: user.subject?.name ?? null,
      position: user.position,
      experienceYears: user.experienceYears,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private async assertGeoComplete(userId: string, input: UpdateProfileInput | AdminUpdateUserInput): Promise<void> {
    const touchesGeo = input.regionId !== undefined || input.districtId !== undefined || input.schoolId !== undefined;
    if (!touchesGeo) return;

    const current = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { regionId: true, districtId: true, schoolId: true },
    });

    const regionId = input.regionId ?? current.regionId;
    const districtId = input.districtId ?? current.districtId;
    const schoolId = input.schoolId ?? current.schoolId;

    if (!regionId || !districtId || !schoolId) {
      throw badRequest('GEO_INCOMPLETE', 'region, district and school must all be set together');
    }

    await assertGeoConsistent(regionId, districtId, schoolId);
  }

  private assertNotSelf(userId: string): void {
    if (userId === this.currentUserId) {
      throw badRequest('ADMIN_CANNOT_MODIFY_SELF', "you cannot change your own account's role or active status");
    }
  }

  private async findOrThrow(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, active: true } });
    if (!user) throw notFound('AUTH_USER_NOT_FOUND', 'user not found');
    return user;
  }
}
