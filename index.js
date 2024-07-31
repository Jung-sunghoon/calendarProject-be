import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
// import { json } from "body-parser";
// require("dotenv").config();

const app = express();
const port = 8080;

// app.use(json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Swagger JSDoc 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Portfolio API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/", // 요청 URL
      },
    ],
    schemes: ["http"],
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          name: "Authorization",
          in: "header",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/apis/*.controller.js"], // Swagger 문서 파일 경로
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Swagger UI 설정
app.use("/api-docs", serve, setup(swaggerSpec, { explorer: true }));
app.use("/api-docs", serve, setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
