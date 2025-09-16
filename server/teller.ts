import https from 'https';
import { storage } from './storage';
import { type InsertAccount, type InsertTransaction } from '@shared/schema';

interface TellerAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
  balance: {
    available: number;
    ledger: number;
  };
  currency: string;
  enrollment_id: string;
  institution: {
    name: string;
  };
  last_four: string;
  status: string;
}

interface TellerTransaction {
  id: string;
  account_id: string;
  amount: string;
  date: string;
  description: string;
  details: {
    category?: string;
    processing_status: string;
  };
  status: string;
  type: string;
}

interface TellerEnrollment {
  accessToken: string;
  user: {
    id: string;
  };
  enrollment: {
    id: string;
  };
}

class TellerService {
  private baseURL: string;
  private applicationId: string;
  private cert: string;
  private key: string;
  private environment: string;

  constructor() {
    this.applicationId = process.env.TELLER_APPLICATION_ID!;
    this.cert = process.env.TELLER_CERTIFICATE!;
    this.key = process.env.TELLER_PRIVATE_KEY!;
    this.environment = process.env.TELLER_ENVIRONMENT || 'sandbox';
    
    if (!this.applicationId || !this.cert || !this.key) {
      throw new Error('Missing required Teller environment variables');
    }

    this.baseURL = 'https://api.teller.io';
  }

  private async makeRequest<T>(
    method: string,
    path: string,
    accessToken: string,
    data?: any
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : undefined;
      
      const options: https.RequestOptions = {
        hostname: 'api.teller.io',
        port: 443,
        path,
        method,
        cert: this.cert,
        key: this.key,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TrueBalance/1.0',
          ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              const response = body ? JSON.parse(body) : {};
              resolve(response);
            } else {
              reject(new Error(`Teller API error: ${res.statusCode} ${body}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse Teller response: ${error}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Teller request failed: ${error.message}`));
      });

      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  async syncUserAccounts(userId: string, accessToken: string): Promise<void> {
    try {
      console.log(`Syncing accounts for user ${userId}`);
      
      // Fetch accounts from Teller
      const tellerAccounts = await this.makeRequest<TellerAccount[]>(
        'GET',
        '/accounts',
        accessToken
      );

      // Save accounts to database
      for (const tellerAccount of tellerAccounts) {
        const accountData: InsertAccount = {
          userId,
          externalId: tellerAccount.id,
          name: tellerAccount.name,
          type: tellerAccount.type.toLowerCase(),
          balance: tellerAccount.balance.ledger.toString(),
          currency: tellerAccount.currency,
          isActive: tellerAccount.status === 'open',
          lastSyncAt: new Date()
        };

        // Check if account already exists
        const existingAccounts = await storage.getAccountsByUserId(userId);
        const existingAccount = existingAccounts.find(acc => acc.externalId === tellerAccount.id);
        
        if (existingAccount) {
          // Update existing account
          await storage.updateAccount(existingAccount.id, {
            balance: accountData.balance,
            isActive: accountData.isActive,
            lastSyncAt: accountData.lastSyncAt
          });
        } else {
          // Create new account
          await storage.createAccount(accountData);
        }
      }

      console.log(`Successfully synced ${tellerAccounts.length} accounts for user ${userId}`);
    } catch (error) {
      console.error('Error syncing accounts:', error);
      throw error;
    }
  }

  async syncAccountTransactions(userId: string, accessToken: string, accountId?: string): Promise<void> {
    try {
      console.log(`Syncing transactions for user ${userId}${accountId ? `, account ${accountId}` : ''}`);
      
      // Get user's accounts from database
      const userAccounts = await storage.getAccountsByUserId(userId);
      const accountsToSync = accountId 
        ? userAccounts.filter(acc => acc.id === accountId)
        : userAccounts;

      for (const account of accountsToSync) {
        // Fetch transactions from Teller for this account
        const tellerTransactions = await this.makeRequest<TellerTransaction[]>(
          'GET',
          `/accounts/${account.externalId}/transactions`,
          accessToken
        );

        // Get existing transactions to avoid duplicates
        const existingTransactions = await storage.getTransactionsByAccountId(account.id);
        const existingExternalIds = new Set(existingTransactions.map(t => t.externalId));

        // Prepare new transactions
        const newTransactions: InsertTransaction[] = [];
        
        for (const tellerTx of tellerTransactions) {
          if (!existingExternalIds.has(tellerTx.id)) {
            const transactionData: InsertTransaction = {
              accountId: account.id,
              externalId: tellerTx.id,
              amount: tellerTx.amount,
              description: tellerTx.description,
              category: this.categorizeTransaction(tellerTx.description),
              date: new Date(tellerTx.date),
              type: tellerTx.type === 'debit' ? 'expense' : 'income',
              status: tellerTx.status
            };
            newTransactions.push(transactionData);
          }
        }

        // Bulk insert new transactions
        if (newTransactions.length > 0) {
          await storage.createTransactions(newTransactions);
          console.log(`Added ${newTransactions.length} new transactions for account ${account.name}`);
        }
      }

      console.log(`Successfully synced transactions for user ${userId}`);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  private categorizeTransaction(description: string): string {
    const desc = description.toLowerCase();
    
    // Food and dining
    if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('food') || 
        desc.includes('starbucks') || desc.includes('mcdonald') || desc.includes('pizza') ||
        desc.includes('grocery') || desc.includes('market') || desc.includes('whole foods')) {
      return 'food';
    }
    
    // Transportation
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('uber') || 
        desc.includes('lyft') || desc.includes('taxi') || desc.includes('parking') ||
        desc.includes('transit') || desc.includes('subway') || desc.includes('bus')) {
      return 'transportation';
    }
    
    // Shopping
    if (desc.includes('amazon') || desc.includes('walmart') || desc.includes('target') ||
        desc.includes('shopping') || desc.includes('retail') || desc.includes('store')) {
      return 'shopping';
    }
    
    // Housing
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('utilities') ||
        desc.includes('electric') || desc.includes('water') || desc.includes('internet') ||
        desc.includes('cable') || desc.includes('phone')) {
      return 'housing';
    }
    
    // Entertainment
    if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('netflix') ||
        desc.includes('spotify') || desc.includes('gaming') || desc.includes('gym') ||
        desc.includes('fitness') || desc.includes('subscription')) {
      return 'entertainment';
    }
    
    // Healthcare
    if (desc.includes('medical') || desc.includes('doctor') || desc.includes('pharmacy') ||
        desc.includes('hospital') || desc.includes('health') || desc.includes('dental')) {
      return 'healthcare';
    }
    
    // Default category
    return 'other';
  }

  async getAccountBalance(accessToken: string, accountExternalId: string): Promise<number> {
    try {
      const account = await this.makeRequest<TellerAccount>(
        'GET',
        `/accounts/${accountExternalId}`,
        accessToken
      );
      return account.balance.ledger;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }

  getTellerConnectConfig() {
    return {
      applicationId: this.applicationId,
      environment: this.environment,
      connectUrl: `https://connect.teller.io`
    };
  }
}

export const tellerService = new TellerService();