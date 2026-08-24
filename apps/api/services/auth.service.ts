import { Inject, Injectable, InjectContext } from '@tsed/di';
import { $log, PlatformContext } from '@tsed/common';
import type { Request } from 'express';
import prisma from '@/modules/db';
import { comparePassword, createAccessToken, hashPassword, needsRehash } from '@/modules/auth';
import { sendMail } from '@/modules/mailer';
import { badRequest, notFound, requireUserId, unauthorized } from '@/utils/errors.utils';
import { clearLoginFailures, loginBlockedFor, LOGIN_GUARD, recordLoginFailure } from '@/utils/login-guard.utils';
import { checkEmailVerificationCode, issueEmailVerificationCode } from '@/utils/email-verification.utils';
import { verificationEmail } from '@/utils/mail-templates.utils';
import { assertGeoConsistent } from '@/utils/geo-consistency.utils';
import { TooManyRequests } from '@/middlewares/rate-limit.middleware';
import { TokenService } from '@/services/token.service';
import { USER_PUBLIC_SELECT } from '@/utils/constants';
import { USER_ROLE } from '../generated/prisma';
import type { SignupInput, SigninInput, VerifyEmailInput } from '@/inputs/auth.input';

@Injectable()
export class AuthService {
  @InjectContext()
  private context!: PlatformContext;

  @Inject()
  private tokenService!: TokenService;

  private get request() {
    return this.context.getRequest<Request>();
  }

  private get user() {
    return this.request.user;
  }

  async signup(input: SignupInput) {
    const email = input.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw badRequest('AUTH_EMAIL_TAKEN', 'This email is already registered');

    await assertGeoConsistent(input.regionId, input.districtId, input.schoolId);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email,
        password: await hashPassword(input.password),
        locale: input.locale,
        role: USER_ROLE.TEACHER,
        phone: input.phone,
        gender: input.gender,
        regionId: input.regionId,
        districtId: input.districtId,
        schoolId: input.schoolId,
        subjectId: input.subjectId,
        position: input.position,
        experienceYears: input.experienceYears,
      },
      select: USER_PUBLIC_SELECT,
    });

    await this.sendVerificationEmail(user.id, email);

    return {
      success: true,
      _code: 'AUTH_SIGNED_UP',
      _message: 'Registered successfully',
      data: createAccessToken(user),
    };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const userId = requireUserId(this.user);

    const ok = await checkEmailVerificationCode(userId, input.code);
    if (!ok) throw badRequest('AUTH_VERIFICATION_CODE_INVALID', 'the verification code is invalid or expired');

    await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } });

    return { success: true, _code: 'AUTH_EMAIL_VERIFIED', _message: 'Email verified' };
  }

  async resendVerification() {
    const userId = requireUserId(this.user);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });
    if (!user) throw notFound('AUTH_USER_NOT_FOUND', 'user not found');
    if (user.emailVerified) throw badRequest('AUTH_EMAIL_ALREADY_VERIFIED', 'email is already verified');

    await this.sendVerificationEmail(userId, user.email);

    return { success: true, _code: 'AUTH_VERIFICATION_SENT', _message: 'Verification code sent' };
  }

  private async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const code = await issueEmailVerificationCode(userId);
    const { subject, html, text } = verificationEmail(code);
    await sendMail({ to: email, subject, html, text });
  }

  async signin(input: SigninInput) {
    const email = input.email.toLowerCase();

    const blockedFor = await loginBlockedFor(email);
    if (blockedFor > 0) {
      throw new TooManyRequests(`too many failed attempts, try again in ${Math.ceil(blockedFor / 60)} minutes`, {
        retryAfter: blockedFor,
        limit: LOGIN_GUARD.MAX_FAILURES,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      await recordLoginFailure(email);
      throw badRequest('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.password);

    if (!isValid) {
      await recordLoginFailure(email);
      throw badRequest('AUTH_INVALID_CREDENTIALS', 'Invalid email or password');
    }

    if (!user.active) {
      throw unauthorized('AUTH_ACCOUNT_INACTIVE', 'This account is inactive');
    }

    await clearLoginFailures(email);

    if (needsRehash(user.password)) {
      await this.rehashPassword(user.id, input.password);
    }

    return { success: true, data: createAccessToken(user) };
  }

  async me() {
    const user = await prisma.user.findUnique({
      where: { id: this.user?.id },
      select: USER_PUBLIC_SELECT,
    });

    if (!user || user.deletedAt) throw notFound('AUTH_USER_NOT_FOUND', 'User not found');

    return { success: true, data: { ...user, isAdmin: user.role === USER_ROLE.ADMIN } };
  }

  async logout() {
    const payload = this.request.auth;
    if (payload) await this.tokenService.revoke(payload);

    return { success: true, _code: 'AUTH_SIGNED_OUT', _message: 'Signed out' };
  }

  private async rehashPassword(userId: string, plainPassword: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: await hashPassword(plainPassword) },
      });
    } catch (error) {
      $log.warn({ event: 'PASSWORD_REHASH_FAILED', userId, message: (error as Error).message });
    }
  }
}
