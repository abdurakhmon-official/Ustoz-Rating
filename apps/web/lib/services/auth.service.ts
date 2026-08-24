import type { AccessTokenOutput, SigninInput, SignupInput, UserOutput, VerifyEmailInput } from '@repo/contracts';
import { BaseService } from '@/lib/services/base.service';

export class AuthService extends BaseService<UserOutput, SignupInput, never> {
  protected BASE_PATH = 'auth';

  async signUp(input: SignupInput) {
    return this.sendPost<AccessTokenOutput>('/signup', input);
  }

  async signIn(input: SigninInput) {
    return this.sendPost<AccessTokenOutput>('/signin', input);
  }

  async signOut() {
    return this.sendPost<void>('/logout', {});
  }

  async me() {
    return this.sendGet<UserOutput>('/me');
  }

  async verifyEmail(input: VerifyEmailInput) {
    return this.sendPost<void>('/verify-email', input);
  }

  async resendVerification() {
    return this.sendPost<void>('/resend-verification', {});
  }
}

export const authService = new AuthService();
