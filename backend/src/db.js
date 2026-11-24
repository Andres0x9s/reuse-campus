import 'dotenv/config';
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

export async function query(sql, params = [], conn = db) {
  const [result] = await conn.execute(sql, params);
  return result;
}

export async function transaction(work) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const result = await work(conn);

    await conn.commit();

    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
