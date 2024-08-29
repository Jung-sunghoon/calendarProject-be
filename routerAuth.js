import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const routerAuth = express.Router();

// 구글 로그인 관련 API
routerAuth.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false })); // 프로파일과 이메일 정보를 받는다.
routerAuth.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const token = jwt.sign(
      { email: req.user.email, username: req.user.username, nickname: req.user.nickname },
      process.env.SESSION_SECRET,
      { expiresIn: "1h" }
    );
    res.redirect(`http://localhost:5502/src/none/login-success.html?token=${token}`);
  }
);

export default routerAuth;
