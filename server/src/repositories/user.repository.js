import { User } from '../models/user.model.js';
import { BaseRepository } from './base.repository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  findByEmail(email, includePassword = false) {
    const query = this.model.findOne({ email: email.toLowerCase() });
    return includePassword ? query.select('+password') : query;
  }

  findByRefreshSubject(id) {
    return this.model.findById(id).select('+refreshTokenHash');
  }

  findByEmailVerificationToken(tokenHash) {
    return this.model
      .findOne({
        emailVerificationToken: tokenHash,
        emailVerificationExpires: { $gt: Date.now() }
      })
      .select('+emailVerificationToken +emailVerificationExpires');
  }

  findByPasswordResetToken(tokenHash) {
    return this.model
      .findOne({
        passwordResetToken: tokenHash,
        passwordResetExpires: { $gt: Date.now() }
      })
      .select('+passwordResetToken +passwordResetExpires +password');
  }
}

export const userRepository = new UserRepository();
