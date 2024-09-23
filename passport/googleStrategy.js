import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import pool from "../DB/db.js";

export default () => {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.REDIRECT_URI,
      },
      async (accessToken, refreshToken, profile, done) => {
        // console.log("google profile: ", profile);
        // const connection = await pool.getConnection();
        try {
          let rows;
          [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
            profile?.emails[0].value,
          ]);
          console.log("Query result:", rows);
          console.log("Querying for email:", [profile.emails[0].value]);
          if (rows) {
            console.log("기존 사용자:", rows);
            done(null, rows);
          } else {
            const newUser = {
              email: profile.emails[0].value,
              username: profile.name.familyName + profile.name.givenName,
              nickname: profile.displayName,
            };
            console.log("새 사용자 추가:", newUser);
            try {
              const result = await pool.query(
                "INSERT INTO users (email, username, nickname) VALUES (?, ?, ?)",
                [newUser.email, newUser.username, newUser.nickname]
              );
              console.log("새 사용자 추가 성공:", result);
              done(null, newUser);
            } catch (insertError) {
              if (insertError.code == "ER_DUP_ENTRY") {
                console.log("중복된 이메일, 기존 사용자 정보 조회");
                [rows] = await pool.query(
                  "SELECT * FROM users WHERE email = ?",
                  [profile.emails[0].value]
                );
                if (rows && rows.length > 0) {
                  return done(null, rows);
                }
              }
              console.error("사용자 추가 중 오류 발생:", insertError);
              return done(insertError);
            }
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
