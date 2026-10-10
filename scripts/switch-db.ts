import * as fs from "fs";
import * as path from "path";

const target = process.argv[2] || "sqlite";
const rootDir = process.cwd();

if (target === "sqlite") {
  const sqliteSchema = fs.readFileSync(path.join(rootDir, "prisma", "schema.sqlite.prisma"), "utf-8");
  fs.writeFileSync(path.join(rootDir, "prisma", "schema.prisma"), sqliteSchema);
  
  // Update .env
  let env = "";
  if (fs.existsSync(path.join(rootDir, ".env"))) {
    env = fs.readFileSync(path.join(rootDir, ".env"), "utf-8");
    env = env.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
  } else {
    env = `DATABASE_URL="file:./dev.db"\nJWT_SECRET="servisku-secure-random-jwt-secret-key-32-chars-long"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n`;
  }
  fs.writeFileSync(path.join(rootDir, ".env"), env);
  console.log("Successfully switched Prisma schema to SQLite (file:./dev.db)");
} else if (target === "postgres") {
  let schema = fs.readFileSync(path.join(rootDir, "prisma", "schema.prisma"), "utf-8");
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(path.join(rootDir, "prisma", "schema.prisma"), schema);

  let env = "";
  if (fs.existsSync(path.join(rootDir, ".env"))) {
    env = fs.readFileSync(path.join(rootDir, ".env"), "utf-8");
    env = env.replace(/DATABASE_URL=.*/, 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/servisku?schema=public"');
  } else {
    env = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/servisku?schema=public"\nJWT_SECRET="servisku-secure-random-jwt-secret-key-32-chars-long"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n`;
  }
  fs.writeFileSync(path.join(rootDir, ".env"), env);
  console.log("Successfully switched Prisma schema to PostgreSQL");
}
