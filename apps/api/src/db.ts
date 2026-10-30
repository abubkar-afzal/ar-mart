import mongoose from 'mongoose';
import { env } from './env.ts';

/** Mask any password segment inside a MongoDB URI for safe logging. */
export function maskMongoUri(uri: string): string {
  // mongodb://user:pass@host  or  mongodb+srv://user:pass@host
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
}

/** Turn a Mongoose/Node connection error into a clear, actionable hint. */
export function explainMongoError(err: unknown, uri: string): string {
  const e = err as { name?: string; message?: string; code?: string };
  const host = uri.replace(/^mongodb(\+srv)?:\/\//, '').split(/[/@?]/).pop() ?? '(unknown host)';

  if (e?.message?.includes('ECONNREFUSED')) {
    return [
      `Cannot reach MongoDB at ${host}: connection refused.`,
      `  • Is MongoDB running locally?  Get-Service MongoDB  (Status should be "Running")`,
      `  • If not installed, download the Community Server MSI from https://www.mongodb.com/try/download/community`,
      `  • Or point MONGODB_URI in .env at MongoDB Atlas instead.`,
    ].join('\n');
  }
  if (e?.message?.includes('Authentication failed')) {
    return [
      `MongoDB rejected the credentials for ${host}.`,
      `  • Check the username/password in MONGODB_URI in .env (URL-encode special chars: @ → %40, : → %3A).`,
      `  • If using Atlas, verify the database user exists under Database Access.`,
    ].join('\n');
  }
  if (e?.message?.includes('ENOTFOUND') || e?.message?.includes('getaddrinfo')) {
    return [
      `MongoDB hostname could not be resolved: ${host}.`,
      `  • Check for typos in MONGODB_URI.`,
      `  • If Atlas SRV, try a VPN-free network, or use the non-SRV connection string from Atlas.`,
    ].join('\n');
  }
  if (e?.message?.includes('server selection timed out')) {
    return [
      `MongoDB did not respond within the timeout for ${host}.`,
      `  • Server is unreachable (firewall? VPN? Atlas IP whitelist?).`,
      `  • Atlas: verify "Network Access" includes your IP.`,
    ].join('\n');
  }
  return `MongoDB connection failed: ${e?.message ?? 'unknown error'}`;
}

export async function connectDb(opts: { timeoutMs?: number } = {}): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? 10000;
  mongoose.set('strictQuery', true);

  console.log(`[db] connecting to ${maskMongoUri(env.mongoUri)} (timeout ${timeoutMs}ms)`);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: timeoutMs,
    });
  } catch (err) {
    console.error(`[db] ${explainMongoError(err, env.mongoUri)}`);
    throw err;
  }

  console.log(`[db] connected: ${mongoose.connection.name} (host: ${mongoose.connection.host})`);
}

export function isTransactionsSupported(): boolean {
  const client = mongoose.connection.getClient() as unknown as {
    topology?: { description?: { type?: string } };
  };
  const type = client?.topology?.description?.type;
  return type === 'ReplicaSetWithPrimary' || type === 'Sharded';
}