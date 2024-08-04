import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import session from "express-session";
import googleOauth from "./loginGoogleOauth.js";
import "./DB/executeSqlFile.js";

const app = express();
const port = 8080;

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

app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS를 사용하는 경우 true로 설정
  })
);

// Swagger UI 설정
app.use("/api-docs", serve, setup(swaggerSpec, { explorer: true }));
app.use("/api-docs", serve, setup(swaggerSpec));

// 로그인 상태 확인 미들웨어
const checkLoginStatus = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

app.get("/", (req, res) => {
  res.send(`

    <h1>hello world</h1>
    <a href="/login/google">log in</a>`);
});

app.get("/dashboard", checkLoginStatus, (req, res) => {
  res.send(`Login successful!`);
});

app.get("/login/google", (req, res) => {
  res.redirect(googleOauth.getGoogleOauthURL());
});

app.get("/Oauth/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const profile = await googleOauth.getGoogleUser(code);

    req.session.user = profile;

    console.log("User profile:", profile);
    console.log("Authorization Code:", JSON.stringify(code));

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error during Google OAuth:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
