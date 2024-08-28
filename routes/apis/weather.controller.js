import { config } from "dotenv";
import { Router } from "express";
import axios from "axios";

config();

const router = Router();

// 환경변수에서 API URL과 서비스 키를 가져옵니다.
const WEATHER_API_URL = process.env.WEATHER_API_URL;
const SERVICE_KEY = process.env.SERVICE_KEY;

// 서울 중구의 X, Y 좌표 값
const SEONGDONG_NX = "55";
const SEONGDONG_NY = "127";

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: 서울 중구 날씨 정보 조회
 *     description: 서울 중구의 날씨 정보를 조회합니다.
 *     parameters:
 *       - name: pageNo
 *         in: query
 *         description: 페이지 번호
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: numOfRows
 *         in: query
 *         description: 한 페이지 결과 수
 *         required: false
 *         schema:
 *           type: integer
 *           default: 12
 *       - name: dataType
 *         in: query
 *         description: 요청 자료 형식 (XML/JSON)
 *         required: false
 *         schema:
 *           type: string
 *           default: JSON
 *       - name: base_date
 *         in: query
 *         description: 발표일자 (YYYYMMDD 형식)
 *         required: false
 *         schema:
 *           type: string
 *           default: "현재 날짜"
 *       - name: base_time
 *         in: query
 *         description: 발표 시각 (HHmm 형식, 문자열로 입력)
 *         required: false
 *         schema:
 *           type: string
 *           default: "0500"
 *     responses:
 *       200:
 *         description: 서울 중구의 날씨 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultCode:
 *                   type: string
 *                   example: "00"
 *                 resultMsg:
 *                   type: string
 *                   example: "OK"
 *                 numOfRows:
 *                   type: integer
 *                   example: 12
 *                 pageNo:
 *                   type: integer
 *                   example: 1
 *                 totalCount:
 *                   type: integer
 *                   example: 3
 *                 dataType:
 *                   type: string
 *                   example: "JSON"
 *                 baseDate:
 *                   type: string
 *                   example: "20240822"
 *                 baseTime:
 *                   type: string
 *                   example: "0500"
 *                 nx:
 *                   type: string
 *                   example: "55"
 *                 ny:
 *                   type: string
 *                   example: "127"
 *                 category:
 *                   type: string
 *                   example: "RN1"
 *                 obsrValue:
 *                   type: string
 *                   example: "0"
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */

router.get("/weather", async (req, res) => {
  try {
    const today = new Date();
    const base_date =
      req.query.base_date || today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD 형식
    const base_time = req.query.base_time || "0500"; // 기본값은 0500

    const { pageNo = 1, numOfRows = 12, dataType = "JSON" } = req.query;

    // API 요청 URL을 구성합니다.
    const url = `${WEATHER_API_URL}?serviceKey=${SERVICE_KEY}&pageNo=${pageNo}&numOfRows=${numOfRows}&dataType=${dataType}&base_date=${base_date}&base_time=${base_time}&nx=${SEONGDONG_NX}&ny=${SEONGDONG_NY}`;

    // 외부 API를 호출합니다.
    const response = await axios.get(url);

    // API 응답을 클라이언트에 반환합니다.
    res.json(response.data);
  } catch (error) {
    // 오류 처리
    console.error("Weather API request failed:", error);
    res.status(500).send("서버 오류");
  }
});

export default router;
