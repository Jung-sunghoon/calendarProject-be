import express from "express";
import { config } from "dotenv";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import session from "express-session";
import executeSqlFile from "./DB/executeSqlFile.js";
import passport from "passport";
import router from "./router.js";
import routerAuth from "./routerAuth.js";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import googleStrategy from "./passport/googleStrategy.js";
import jwtStrategy from "./passport/jwtStrategy.js";

// test.sql문 실행
executeSqlFile();

// 환경 변수 로드
config();

const app = express();
const PORT = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fePath = path.join(__dirname, "views");

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS를 사용하는 경우 true로 설정
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);
app.use("/oauth", routerAuth);
app.use(express.static("public"));

googleStrategy(); // Google 전략 등록
jwtStrategy();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
