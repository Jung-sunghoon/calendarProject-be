import { createPool } from "mariadb";
import { config } from "dotenv";

// 환경 변수 로드
config();

// MariaDB 연결 풀 설정
const pool = createPool({
  host: process.env.CALENDAR_DB_HOST,
  user: process.env.CALENDAR_DB_USER,
  password: process.env.CALENDAR_DB_PASSWORD,
  database: process.env.CALENDAR_DB_DATABASE,
  port: process.env.CALENDAR_DB_PORT,
  connectionLimit: 10, // 연결 풀의 최대 연결 수
  acquireTimeout: 50000, // 연결을 얻어오는데 허용되는 최대 시간 (밀리초)
  allowPublicKeyRetrieval: true, // RSA 공개 키 검색 허용
});

export default pool;
