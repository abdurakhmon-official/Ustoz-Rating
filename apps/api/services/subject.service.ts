import { Inject, Injectable } from '@tsed/di';
import prisma from '@/modules/db';
import { conflict, notFound } from '@/utils/errors.utils';
import { AuditService } from '@/services/audit.service';
import type { CreateSubjectInput, UpdateSubjectInput } from '@/inputs/subject.input';

@Injectable()
export class SubjectService {
  @Inject()
  private auditService!: AuditService;

  async list() {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      select: { id: true, name: true, imageKey: true },
      orderBy: { order: 'asc' },
    });

    return { success: true, data: subjects };
  }

  async adminList() {
    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
    });

    return { success: true, data: subjects };
  }

  async create(input: CreateSubjectInput) {
    const existing = await prisma.subject.findUnique({ where: { name: input.name } });
    if (existing) throw conflict('SUBJECT_NAME_TAKEN', 'a subject with this name already exists');

    const subject = await prisma.subject.create({ data: input });
    await this.auditService.log('CREATE', 'Subject', subject.id, undefined, subject);

    return { success: true, data: subject };
  }

  async update(subjectId: string, input: UpdateSubjectInput) {
    const before = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!before) throw notFound('SUBJECT_NOT_FOUND', 'subject not found');

    if (input.name && input.name !== before.name) {
      const existing = await prisma.subject.findUnique({ where: { name: input.name } });
      if (existing) throw conflict('SUBJECT_NAME_TAKEN', 'a subject with this name already exists');
    }

    const subject = await prisma.subject.update({ where: { id: subjectId }, data: input });
    await this.auditService.log('UPDATE', 'Subject', subjectId, before, subject);

    return { success: true, data: subject };
  }

  async delete(subjectId: string) {
    const before = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!before) throw notFound('SUBJECT_NOT_FOUND', 'subject not found');

    await prisma.subject.update({ where: { id: subjectId }, data: { isActive: false } });
    await this.auditService.log('DEACTIVATE', 'Subject', subjectId, before, { isActive: false });

    return { success: true, data: null };
  }
}
