import { 
  users, 
  accounts, 
  transactions, 
  sessions,
  type User, 
  type InsertUser,
  type Account,
  type Transaction,
  type Session,
  type InsertAccount,
  type InsertTransaction,
  type InsertSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  
  // Account management
  getAccountsByUserId(userId: string): Promise<Account[]>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, updates: Partial<Account>): Promise<Account | undefined>;
  
  // Transaction management
  getTransactionsByAccountId(accountId: string, limit?: number): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createTransactions(transactions: InsertTransaction[]): Promise<Transaction[]>;
  
  // Teller integration management
  setUserTellerToken(userId: string, accessToken: string): Promise<void>;
  getUserTellerToken(userId: string): Promise<string | undefined>;
  removeUserTellerToken(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getSession(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async getAccountsByUserId(userId: string): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | undefined> {
    const [account] = await db
      .update(accounts)
      .set(updates)
      .where(eq(accounts.id, id))
      .returning();
    return account || undefined;
  }

  async getTransactionsByAccountId(accountId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date))
      .limit(limit);
  }

  async getTransactionsByUserId(userId: string, limit = 50): Promise<Transaction[]> {
    return await db
      .select({
        id: transactions.id,
        accountId: transactions.accountId,
        externalId: transactions.externalId,
        amount: transactions.amount,
        description: transactions.description,
        category: transactions.category,
        date: transactions.date,
        type: transactions.type,
        status: transactions.status,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(accounts.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async createTransactions(insertTransactions: InsertTransaction[]): Promise<Transaction[]> {
    return await db
      .insert(transactions)
      .values(insertTransactions)
      .returning();
  }

  // Teller integration methods with secure AES-256-GCM encryption
  async setUserTellerToken(userId: string, accessToken: string): Promise<void> {
    const encrypted = this.secureEncrypt(accessToken);
    
    await db
      .update(users)
      .set({ tellerAccessToken: encrypted })
      .where(eq(users.id, userId));
  }

  async getUserTellerToken(userId: string): Promise<string | undefined> {
    const [user] = await db
      .select({ tellerAccessToken: users.tellerAccessToken })
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user?.tellerAccessToken) {
      return undefined;
    }

    try {
      return this.secureDecrypt(user.tellerAccessToken);
    } catch (error) {
      console.error('Failed to decrypt Teller token:', error);
      return undefined;
    }
  }

  async removeUserTellerToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ tellerAccessToken: null })
      .where(eq(users.id, userId));
  }

  // Secure AES-256-GCM encryption helpers
  private secureEncrypt(text: string): string {
    const crypto = require('crypto');
    
    // Ensure strong key management - require proper key in production
    const secret = process.env.TELLER_TOKEN_KEY || process.env.SESSION_SECRET;
    if (!secret || secret === 'fallback-secret') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('TELLER_TOKEN_KEY or strong SESSION_SECRET required in production');
      }
      console.warn('Warning: Using weak encryption key. Set TELLER_TOKEN_KEY environment variable.');
    }
    
    // Create 256-bit key from secret
    const key = crypto.scryptSync(secret || 'fallback-secret', 'teller-token', 32);
    
    // Generate random 12-byte IV (GCM prefers 12 bytes)
    const iv = crypto.randomBytes(12);
    
    // Create cipher with proper API
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt text
    const ciphertext = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine and encode: iv:tag:ciphertext (all base64 encoded)
    const combined = Buffer.concat([iv, tag, ciphertext]);
    return combined.toString('base64');
  }

  private secureDecrypt(encryptedData: string): string {
    const crypto = require('crypto');
    
    // Decode combined data
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const iv = combined.subarray(0, 12);          // 12 bytes IV
    const tag = combined.subarray(12, 12 + 16);   // 16 bytes auth tag
    const ciphertext = combined.subarray(12 + 16); // Rest is ciphertext
    
    // Use same key derivation
    const secret = process.env.TELLER_TOKEN_KEY || process.env.SESSION_SECRET || 'fallback-secret';
    const key = crypto.scryptSync(secret, 'teller-token', 32);
    
    // Create decipher with proper API
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    const plaintext = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]);
    
    return plaintext.toString('utf8');
  }
}

export const storage = new DatabaseStorage();