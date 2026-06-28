import { createRequire } from "module";
import pg from "pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config(); // lê o .env

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const phone    = "47999000001";     // telefone de acesso
const password = "admin123";        // senha inicial (troque depois)
const name     = "Super Admin";

const hash = await bcrypt.hash(password, 10);

const { rows } = await pool.query(
  `SELECT id FROM users WHERE phone = $1`,
  [phone]
);

if (rows.length > 0) {
  console.log("Super admin já existe, nenhuma ação necessária.");
} else {
  await pool.query(
    `INSERT INTO users (name, phone, password_hash, role)
     VALUES ($1, $2, $3, 'super_admin')`,
    [name, phone, hash]
  );
  console.log(`Super admin criado com sucesso!`);
  console.log(`  Telefone: ${phone}`);
  console.log(`  Senha:    ${password}`);
}

await pool.end();