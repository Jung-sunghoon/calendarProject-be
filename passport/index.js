import passport from "passport";

// import pool from "../DB/db.js";

export default () => {
  // user를 전달 받아 세션(req.session.passport.user)에 저장
  // 로그인 과정을 할때만 실행
  passport.serializeUser((req, user, done) => {
    console.log(user);
    done(null, user.email);
  });

  // 서버로 들어오는 요청마다 세션정보를 실제 DB와 비교
  // 해당 유저 정보가 있으면 done을 통해 req.user에 사용자 전체 정보를 저장 (미들웨어에서 req.user를 공통으로 사용 가능)
  passport.deserializeUser(async (req, email, done) => {
    console.log("Deserializing user email:", email);
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
      if (rows && rows.length > 0) {
        console.log(req.user);
        done(null, rows);
      } else {
        done(new Error("User not found"));
      }
    } catch (err) {
      done(err);
    }
  });
};
