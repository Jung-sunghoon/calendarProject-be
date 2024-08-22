import express from "express";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import router from "./router.js";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import session from "express-session";
import googleAuth from "./loginGoogleAuth.js";
import executeSqlFile from "./DB/executeSqlFile.js";
import pool from "./DB/db.js";
import { OAuth2Client } from "google-auth-library";

// test.sql문 실행
executeSqlFile();

// 환경 변수 로드
config();

const app = express();
const PORT = process.env.PORT || 8080;
// const client = new OAuth2Client(process.env.CLIENT_ID);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // HTTPS를 사용하는 경우 true로 설정
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", router);

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

app.get("/login/google", (req, res) => {
  res.redirect(googleAuth.getGoogleAuthURL());
});
app.get("/auth-success", (req, res) => {
  res.send(`
   <h1>로그인 축하</h1>
`);
});

app.get("/Oauth/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const profile = await googleAuth.getGoogleUser(code);
    req.session.user = profile;
    // console.log("User profile:", profile);
    // console.log("Authorization Code:", JSON.stringify(code));
    const { email, name, given_name } = profile;
    // console.log(email, name, given_name);

    // 사용자 정보를 데이터베이스에 저장하거나 확인
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT username FROM users WHERE email = ?",
        [email]
      );
      console.log([rows]);

      if (!rows) {
        await connection.execute(
          "INSERT INTO users (email, username, nickname) VALUES (?, ?, ?)",
          [email, given_name, name]
        );
      }
    } finally {
      connection.release();
    }

    // JWT 토큰을 생성합니다.
    const token = jwt.sign({ email }, process.env.SESSION_SECRET, {
      expiresIn: "1h",
    });

    // 클라이언트로 리다이렉트합니다. 토큰과 사용자 정보를 함께 전달합니다.
    res.redirect(
      `/auth-success?token=${token}&user=${JSON.stringify({
        email,
        given_name,
        name,
      })}`
    );
  } catch (error) {
    console.error("Error during Google OAuth:", error);
    res.status(500).send("Authentication failed");
  }
});

// // 클라이언트 측 인증을 위한 엔드포인트
// app.post("/api/auth/google", async (req, res) => {
//   const { token } = req.body; // 클라이언트에서 전송한 ID 토큰

//   try {
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: YOUR_GOOGLE_CLIENT_ID,
//     });

//     const { email, name, picture } = ticket.getPayload();

//     // 사용자 정보를 데이터베이스에 저장하거나 확인
//     const connection = await pool.getConnection();
//     try {
//       const [rows] = await connection.execute("SELECT id FROM users WHERE email = ?", [email]);

//       if (rows.length === 0) {
//         await connection.execute("INSERT INTO users (email, name, picture) VALUES (?, ?, ?)", [email, name, picture]);
//       }
//     } finally {
//       connection.release();
//     }

//     // JWT 토큰 생성
//     const jwtToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });

//     res.json({ token: jwtToken, user: { email, name, picture } });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(401).send("Authentication failed");
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
