import express from "express";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import router from "./router.js";
import { config } from "dotenv";

// 환경 변수 로드
config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
