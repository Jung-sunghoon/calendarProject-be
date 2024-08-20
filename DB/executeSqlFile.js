import pool from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 현재 파일의 디렉토리 구하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const executeSqlFile = async () => {
  try {
    const sqlFilePath = path.join(__dirname, "test.sql");
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    const connection = await pool.getConnection();
    const queries = sql.split(";").filter((query) => query.trim()); // 각 명령문을 개별적으로 실행
    for (const query of queries) {
      await connection.query(query);
    }
    connection.release();

    console.log("SQL file executed successfully");
  } catch (err) {
    console.error("Error executing SQL file:", err);
  }
};

export default executeSqlFile;
