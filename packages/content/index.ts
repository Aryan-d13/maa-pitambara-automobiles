import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { createClient } from '@vercel/kv';
import Redis from 'ioredis';

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  mapsUrl: string;
}

export interface Tractor {
  id: string;
  name: string;
  hp: string;
  price: string;
  imageUrl: string;
  engine?: string;
  cylinders?: string;
  displacement?: string;
  ptoHp?: string;
  liftingCapacity?: string;
  gears?: string;
  weight?: string;
  category?: string;
}

export interface TranslationDict {
  [key: string]: string;
}

export interface SiteContent {
  contact: ContactInfo;
  translations: {
    en: TranslationDict;
    hi: TranslationDict;
  };
  tractors: Tractor[];
}

export function getContentPath(): string {
  let currentDir = process.cwd();
  // Traverse up to find packages/content/site-content.json
  while (currentDir) {
    const candidateDirect = path.join(currentDir, 'packages', 'content', 'site-content.json');
    if (existsSync(candidateDirect)) {
      return candidateDirect;
    }
    const candidateMonorepoRoot = path.join(currentDir, '..', '..', 'packages', 'content', 'site-content.json');
    if (existsSync(candidateMonorepoRoot)) {
      return candidateMonorepoRoot;
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) {
      break;
    }
    currentDir = parent;
  }
  // Standard fallback
  return path.resolve(__dirname, 'site-content.json');
}

// 1. ioredis TCP Client Setup
let redisClient: Redis | null = null;
export function getRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (!redisClient) {
    redisClient = new Redis(url);
  }
  return redisClient;
}

// 2. Vercel KV REST Client Setup
export function isKVConfigured(): boolean {
  return !!(
    (process.env.KV_URL || process.env.KV_REST_API_URL) &&
    process.env.KV_REST_API_TOKEN
  );
}

let kvClient: ReturnType<typeof createClient> | null = null;
export function getKVClient() {
  if (!isKVConfigured()) return null;
  if (!kvClient) {
    const url = process.env.KV_REST_API_URL || process.env.KV_URL!;
    const token = process.env.KV_REST_API_TOKEN!;
    kvClient = createClient({ url, token });
  }
  return kvClient;
}

/**
 * Reads content database from REDIS_URL, Vercel KV, or local site-content.json.
 */
export async function readContent(): Promise<SiteContent> {
  // 1. Try standard Redis TCP (using REDIS_URL)
  const tcpClient = getRedisClient();
  if (tcpClient) {
    try {
      const data = await tcpClient.get('site_content');
      if (data) {
        return JSON.parse(data);
      }
      
      console.log('Redis TCP: Database empty. Auto-bootstrapping from local site-content.json');
      const localContent = await readLocalContentFile();
      await tcpClient.set('site_content', JSON.stringify(localContent));
      return localContent;
    } catch (err) {
      console.error('Redis TCP Connection Error (falling back):', err);
    }
  }

  // 2. Try Vercel KV REST client (using KV_REST_API_URL)
  const restClient = getKVClient();
  if (restClient) {
    try {
      const content = await restClient.get<SiteContent>('site_content');
      if (content) {
        return content;
      }
      
      console.log('Vercel KV REST: Database empty. Auto-bootstrapping from local site-content.json');
      const localContent = await readLocalContentFile();
      await restClient.set('site_content', localContent);
      return localContent;
    } catch (err) {
      console.error('Vercel KV REST Connection Error (falling back):', err);
    }
  }

  return readLocalContentFile();
}

async function readLocalContentFile(): Promise<SiteContent> {
  const filePath = getContentPath();
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Writes updates to REDIS_URL, Vercel KV, or local site-content.json.
 */
export async function writeContent(content: SiteContent): Promise<void> {
  const tcpClient = getRedisClient();
  const restClient = getKVClient();
  const fileWritePromise = writeLocalContentFile(content);
  
  let databaseWriteSuccessful = false;

  // Write to Redis TCP
  if (tcpClient) {
    try {
      await tcpClient.set('site_content', JSON.stringify(content));
      console.log('Redis TCP: Successfully wrote content database updates.');
      databaseWriteSuccessful = true;
    } catch (err) {
      console.error('Redis TCP Write Error:', err);
    }
  }

  // Write to Vercel KV REST
  if (restClient && !databaseWriteSuccessful) {
    try {
      await restClient.set('site_content', content);
      console.log('Vercel KV REST: Successfully wrote content database updates.');
      databaseWriteSuccessful = true;
    } catch (err) {
      console.error('Vercel KV REST Write Error:', err);
    }
  }

  if (databaseWriteSuccessful) {
    // Gracefully handle serverless write limitations on disk files
    await fileWritePromise.catch(err => {
      console.info('Redis Adapter Info: Local file sync omitted (expected in cloud runtime):', err.message);
    });
    return;
  }

  // Fallback for offline local development
  await fileWritePromise;
}

async function writeLocalContentFile(content: SiteContent): Promise<void> {
  const filePath = getContentPath();
  await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
}
