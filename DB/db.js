// import { createPool } from "mariadb";
// import { config } from "dotenv";

// // 환경 변수 로드
// config();

// // MariaDB 연결 풀 설정
// const pool = createPool({
//   host: process.env.CALENDAR_DB_HOST,
//   user: process.env.CALENDAR_DB_USER,
//   password: process.env.CALENDAR_DB_PASSWORD,
//   database: process.env.CALENDAR_DB_DATABASE,
//   port: process.env.CALENDAR_DB_PORT,
//   connectionLimit: 10, // 연결 풀의 최대 연결 수
//   acquireTimeout: 50000, // 연결을 얻어오는데 허용되는 최대 시간 (밀리초)
//   allowPublicKeyRetrieval: true, // RSA 공개 키 검색 허용
// });

// export default pool;

// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { config } from "dotenv";
// import admin from "firebase-admin";
// import serviceAccount from "../cp.json" assert { type: "json" };

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// // 환경 변수 로드
// config();

// const firebaseConfig = {
//   apiKey: process.env.API_KEY,
//   authDomain: process.env.AUTH_DOMAIN,
//   projectId: process.env.PROJECT_ID,
//   storageBucket: process.env.STORAGE_BUCKET,
//   messagingSenderId: process.env.MESSAGING_SENDER_ID,
//   appId: process.env.APP_ID,
//   measurementId: process.env.MEASUREMENT_ID,
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// export { db, admin };

import { config } from "dotenv";
import admin from "firebase-admin";
import serviceAccount from "../cp.json" assert { type: "json" };

// 환경 변수 로드
config();

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore 인스턴스 가져오기
const db = admin.firestore();

export { db, admin };
