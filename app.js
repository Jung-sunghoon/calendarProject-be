import express from "express";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import router from "./router.js";
import { config } from "dotenv";
import executeSqlFile from "./DB/executeSqlFile.js";

// test.sql문 실행
executeSqlFile();

// 환경 변수 로드
config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
