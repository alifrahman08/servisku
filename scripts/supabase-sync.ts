import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const rootDir = process.cwd();
const envLocalPath = path.join(rootDir, ".env.local");
const envPath = path.join(rootDir, ".env");

export function encodeDatabasePassword(password: string): string {
  return encodeURIComponent(password);
}

export function buildSupabaseUrl(encodedPassword: string): string {
  const host = "aws-0-ap-southeast-1.pooler.supabase.com";
  const port = 5432;
  const user = "postgres.tmqahllsskgkamlimktf";
  const db = "postgres";
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${db}?sslmode=require`;
}

export async function checkConnection(): Promise<{ success: boolean; tables: string[]; error?: string }> {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );
    const tables = result.map((r) => r.table_name || r.TABLE_NAME).filter(Boolean);
    await prisma.$disconnect();
    return { success: true, tables };
  } catch (err: any) {
    await prisma.$disconnect();
    // Sanitize error message to prevent leaking credentials
    const safeError = (err?.message || String(err)).replace(/postgresql:\/\/[^@]+@/g, "postgresql://[REDACTED]@");
    return { success: false, tables: [], error: safeError };
  }
}

async function run() {
  const rawPassword = process.argv[2];

  if (rawPassword) {
    const encoded = encodeDatabasePassword(rawPassword);
    const connectionUrl = buildSupabaseUrl(encoded);

    // Update .env.local
    let envLocal = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, "utf-8") : "";
    if (envLocal.includes("DATABASE_URL=")) {
      envLocal = envLocal.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${connectionUrl}"`);
    } else {
      envLocal += `\nDATABASE_URL="${connectionUrl}"`;
    }
    if (envLocal.includes("DIRECT_URL=")) {
      envLocal = envLocal.replace(/DIRECT_URL=.*/g, `DIRECT_URL="${connectionUrl}"`);
    } else {
      envLocal += `\nDIRECT_URL="${connectionUrl}"`;
    }
    if (!envLocal.includes("JWT_SECRET=")) {
      envLocal += `\nJWT_SECRET="servisku-secure-random-jwt-secret-key-32-chars-long"`;
    }
    if (!envLocal.includes("NEXT_PUBLIC_APP_URL=")) {
      envLocal += `\nNEXT_PUBLIC_APP_URL="http://localhost:3000"`;
    }
    fs.writeFileSync(envLocalPath, envLocal.trim() + "\n");

    // Mirror to .env for Prisma CLI
    let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
    if (env.includes("DATABASE_URL=")) {
      env = env.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${connectionUrl}"`);
    } else {
      env += `\nDATABASE_URL="${connectionUrl}"`;
    }
    if (env.includes("DIRECT_URL=")) {
      env = env.replace(/DIRECT_URL=.*/g, `DIRECT_URL="${connectionUrl}"`);
    } else {
      env += `\nDIRECT_URL="${connectionUrl}"`;
    }
    fs.writeFileSync(envPath, env.trim() + "\n");
    console.log("[OK] Environment files (.env.local and .env) updated securely.");
  } else if (fs.existsSync(envLocalPath)) {
    // If no argument, read from .env.local and sync to .env if needed
    const envLocal = fs.readFileSync(envLocalPath, "utf-8");
    const match = envLocal.match(/DATABASE_URL="?([^"\r\n]+)"?/);
    if (match && match[1] && !match[1].includes("[PASSWORD_PLACEHOLDER]")) {
      let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
      if (env.includes("DATABASE_URL=")) {
        env = env.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${match[1]}"`);
      } else {
        env += `\nDATABASE_URL="${match[1]}"`;
      }
      fs.writeFileSync(envPath, env.trim() + "\n");
      console.log("[OK] Synchronized DATABASE_URL from .env.local to .env.");
    }
  }

  // Check connection
  console.log("[TEST] Testing connection to Supabase PostgreSQL...");
  const conn = await checkConnection();
  if (conn.success) {
    console.log("[SUCCESS] Database connected successfully!");
    console.log(`[INFO] Found ${conn.tables.length} tables in public schema:`, conn.tables);
  } else {
    console.log("[FAILED] Unable to connect:", conn.error);
  }
}

if (require.main === module) {
  run();
}
