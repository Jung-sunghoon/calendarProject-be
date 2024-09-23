import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
// import pool from "../DB/db.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SESSION_SECRET,
};

export default () => {
  passport.use(
    "jwt",
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.execute(
            "SELECT * FROM users WHERE email = ?",
            [jwt_payload.email]
          );

          if (rows) {
            const user = rows;
            return done(null, user);
          } else {
            return done(null, false);
          }
        } finally {
          connection.release(); // 연결을 풀로 반환
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
