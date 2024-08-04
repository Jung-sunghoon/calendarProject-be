import { verify } from "jsonwebtoken";

const checkAuthToken = (req, res, next) => {
  // 헤더에서 Bearer 토큰을 추출
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log(authHeader, "authHeader");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Token not provided" });
  }

  // 토큰을 검증
  verify(token, process.env.SESSION_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Unauthorized - Failed to verify token" });
    }

    // 사용자 정보를 req 객체에 추가
    req.user = decoded;
    next();
  });
};

export default checkAuthToken;
