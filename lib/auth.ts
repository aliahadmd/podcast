import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseHelper, User } from './db';
import { getCloudflareEnv } from './cloudflare';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthHelper {
  private db: DatabaseHelper;

  constructor() {
    this.db = new DatabaseHelper();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: JWTPayload): string {
    const env = getCloudflareEnv();
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      const env = getCloudflareEnv();
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  async register(email: string, password: string, name: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Check if user exists
    const existingUser = await this.db.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const userId = uuidv4();
    const user = await this.db.createUser({
      id: userId,
      email,
      password_hash: passwordHash,
      name,
      role: 'user',
    });

    // Create inactive subscription record
    await this.db.createSubscription({
      id: uuidv4(),
      user_id: userId,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      plan_type: null,
      status: 'inactive',
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: 0,
    });

    // Send welcome email
    try {
      const { EmailHelper } = await import('./email');
      const emailHelper = new EmailHelper();
      await emailHelper.sendWelcomeEmail(email, name);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error - user registration succeeded
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Get user
    const user = await this.db.getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await this.comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getUserFromToken(token: string): Promise<Omit<User, 'password_hash'> | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await this.db.getUserById(payload.userId);
    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.db.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const token = uuidv4();
    const db = this.db['db'];
    const expiresAt = Date.now() + 3600000; // 1 hour

    await db
      .prepare('INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(uuidv4(), user.id, token, expiresAt, Date.now())
      .run();

    // Send password reset email
    try {
      const { EmailHelper } = await import('./email');
      const emailHelper = new EmailHelper();
      await emailHelper.sendPasswordResetEmail(user.email, user.name, token);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error - token is still valid even if email fails
    }

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const db = this.db['db'];
    const resetToken = await db
      .prepare('SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > ?')
      .bind(token, Date.now())
      .first<{ id: string; user_id: string }>();

    if (!resetToken) {
      throw new Error('Invalid or expired token');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user password
    await this.db.updateUser(resetToken.user_id, { password_hash: passwordHash });

    // Mark token as used
    await db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').bind(resetToken.id).run();
  }
}

