import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Calendar API",
      version: "1.0.0",
      description: "API for managing calendar schedules",
    },
    servers: [
      {
        url: "http://localhost:8080/api",
        description: "Local server",
      },
    ],
    schemes: ["http"],
  },
  apis: ["./routes/apis/*.js"], // API 문서 주석을 포함한 파일의 경로
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export { swaggerUi, swaggerSpec };
