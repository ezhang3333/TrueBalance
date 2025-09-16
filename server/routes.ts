import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authenticateToken, type AuthRequest } from "./auth";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

// Strict rate limiting for authentication endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting for authenticated endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: { error: 'Too many API requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // Skip health checks
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply general rate limiting to all API endpoints
  app.use('/api', apiLimiter);

  // Authentication routes
  app.post('/api/auth/register', registerLimiter, async (req, res) => {
    try {
      const { email, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = generateToken(user.id);
      
      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', loginLimiter, async (req, res) => {
    try {
      const { email, password } = insertUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user.id);
      
      // Create session
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
      
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        await storage.deleteSession(token);
      }
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  // Protected routes
  app.get('/api/user/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Account routes
  app.get('/api/accounts', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const accounts = await storage.getAccountsByUserId(req.user!.id);
      res.json(accounts);
    } catch (error) {
      console.error('Accounts error:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  });

  // Transaction routes  
  app.get('/api/transactions', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      // Validate and sanitize limit parameter to prevent abuse
      const sanitizedLimit = Math.min(Math.max(1, limit), 500); // Between 1 and 500
      const transactions = await storage.getTransactionsByUserId(req.user!.id, sanitizedLimit);
      res.json(transactions);
    } catch (error) {
      console.error('Transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Teller integration routes
  app.post('/api/teller/connect', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ error: 'Access token is required' });
      }

      // Import tellerService
      const { tellerService } = await import('./teller');
      
      // Store the access token securely server-side
      await storage.setUserTellerToken(req.user!.id, accessToken);
      
      // Sync accounts and transactions for the user
      await tellerService.syncUserAccounts(req.user!.id, accessToken);
      await tellerService.syncAccountTransactions(req.user!.id, accessToken);
      
      res.json({ 
        message: 'Bank accounts connected successfully',
        success: true 
      });
    } catch (error) {
      console.error('Teller connect error:', error);
      res.status(500).json({ 
        error: 'Failed to connect bank accounts',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/teller/sync', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { accountId } = req.body;
      
      // Get the stored access token
      const accessToken = await storage.getUserTellerToken(req.user!.id);
      
      if (!accessToken) {
        return res.status(400).json({ 
          error: 'No bank connection found. Please connect your bank account first.' 
        });
      }

      // Import tellerService
      const { tellerService } = await import('./teller');
      
      // Sync accounts first, then transactions
      await tellerService.syncUserAccounts(req.user!.id, accessToken);
      await tellerService.syncAccountTransactions(req.user!.id, accessToken, accountId);
      
      res.json({ 
        message: 'Account data synced successfully',
        success: true 
      });
    } catch (error) {
      console.error('Teller sync error:', error);
      res.status(500).json({ 
        error: 'Failed to sync account data',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/teller/config', authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Import tellerService
      const { tellerService } = await import('./teller');
      
      const config = tellerService.getTellerConnectConfig();
      res.json(config);
    } catch (error) {
      console.error('Teller config error:', error);
      res.status(500).json({ error: 'Failed to get Teller configuration' });
    }
  });

  // Enhanced accounts endpoint with balances
  app.get('/api/accounts/:id/balance', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      
      // Get the stored access token
      const accessToken = await storage.getUserTellerToken(req.user!.id);
      
      if (!accessToken) {
        return res.status(400).json({ 
          error: 'No bank connection found. Please connect your bank account first.' 
        });
      }

      // Get account from database
      const accounts = await storage.getAccountsByUserId(req.user!.id);
      const account = accounts.find(acc => acc.id === id);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Import tellerService and get live balance
      const { tellerService } = await import('./teller');
      const liveBalance = await tellerService.getAccountBalance(accessToken, account.externalId);
      
      res.json({ 
        accountId: id,
        balance: liveBalance,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Account balance error:', error);
      res.status(500).json({ error: 'Failed to fetch account balance' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}