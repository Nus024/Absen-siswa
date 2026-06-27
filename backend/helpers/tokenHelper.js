import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export const tokenHelper = {
  generate(payload) {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  },
  verify(token) {
    try {
      return jwt.verify(token, jwtConfig.secret);
    } catch {
      return null;
    }
  }
};
