import app from "./app";
import { logger } from "./lib/logger";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { runMigrations } from "./migrate";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedSuperAdmin() {
  const phone = process.env["SEED_ADMIN_PHONE"] ?? "47999000001";
  const password = process.env["SEED_ADMIN_PASSWORD"] ?? "admin123";
  const name = process.env["SEED_ADMIN_NAME"] ?? "Super Admin";

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.phone, phone))
    .limit(1);

  if (existing) {
    logger.info("Super admin já existe, seed ignorado.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(usersTable).values({ name, phone, passwordHash, role: "super_admin" });
  logger.info({ phone }, "Super admin criado automaticamente.");
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  await runMigrations();
  await seedSuperAdmin();
  await seedSuperAdmin();
});