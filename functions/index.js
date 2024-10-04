import express from "express"; // Express 프레임워크 가져오기
import { config } from "dotenv"; // 환경 변수 로드 라이브러리 가져오기
import { swaggerUi, swaggerSpec } from "./swagger.js"; // Swagger UI와 스펙 가져오기
import router from "./router.js"; // 라우터 모듈 가져오기
import functions from "firebase-functions"; // Firebase Functions 모듈 가져오기
import cors from "cors"; // CORS 미들웨어 가져오기
import { env } from 'process'; // process 모듈에서 env 가져오기

// 환경 변수를 로드하여 env에 추가
config();

const app = express(); // Express 앱 인스턴스 생성

// CORS 설정
const corsOptions = {
  origin: env.PAGE_URL, // 허용할 도메인 (환경 변수에서 가져옴)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 허용할 HTTP 메서드
  credentials: true, // 쿠키와 인증 정보를 포함한 요청 허용
};

// 특정 URL에서만 CORS 허용
app.use(cors(corsOptions)); // 설정된 CORS 옵션을 사용하여 미들웨어 추가

app.use(express.json()); // JSON 형식의 요청 본문을 파싱하는 미들웨어 추가

// Swagger UI를 사용하여 API 문서 제공
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Swagger UI 경로 설정

// "/api" 경로로 라우터 설정
app.use("/api", router); // API 엔드포인트를 위한 라우터 추가

// 정적 파일 제공을 위한 미들웨어 (public 폴더 내의 파일들)
app.use(express.static("public")); // public 폴더의 정적 파일 제공

// Firebase Cloud Functions로 배포할 수 있도록 Express 앱을 HTTP 함수로 감싸기
export const api = functions.region('asia-northeast3').https.onRequest(app); // Firebase Functions에서 사용할 수 있도록 앱을 내보내기
