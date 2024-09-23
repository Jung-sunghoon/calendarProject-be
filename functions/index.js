import express from "express";
import dotenv from "dotenv";
import {swaggerUi, swaggerSpec} from "./swagger.js";
// import session from "express-session";
// import passport from "passport";
import router from "./router.js";
// import routerAuth from "./routerAuth.js";
// import googleStrategy from "./passport/googleStrategy.js";
// import jwtStrategy from "./passport/jwtStrategy.js";
import functions from "firebase-functions"; // Firebase Functions 모듈 가져오기
import cors from "cors";

// 환경 변수 로드
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// app.use(
//     session({
//       secret: process.env.SESSION_SECRET,
//       resave: false,
//       saveUninitialized: false,
//       cookie: {secure: true}, // HTTPS를 사용하는 경우 true로 설정 (개발 중에는 false로 설정)
//     }),
// );

// app.use(passport.initialize());
// app.use(passport.session());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);
// app.use("/oauth", routerAuth);
app.use(express.static("public"));

// googleStrategy(); // Google 전략 등록
// jwtStrategy();

// Firebase Cloud Functions로 배포할 수 있도록 Express 앱을 HTTP 함수로 감싸기
export const api = functions.region('asia-northeast3').https.onRequest(app);
