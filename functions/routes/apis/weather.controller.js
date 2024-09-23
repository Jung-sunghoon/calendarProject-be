/* eslint-env node */

import { config } from "dotenv";
import { Router } from "express";
import axios from "axios";
import { env } from 'process';

config();

const router = Router();

// 환경변수에서 API URL과 서비스 키를 가져옵니다.
const WEATHER_API_URL = env.WEATHER_API_URL;
const SERVICE_KEY = env.SERVICE_KEY;

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get weather data for a specific city
 *     parameters:
 *       - name: city
 *         in: query
 *         required: true
 *         description: The name of the city to get weather data for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coord:
 *                   type: object
 *                   properties:
 *                     lon:
 *                       type: number
 *                     lat:
 *                       type: number
 *                 weather:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       main:
 *                         type: string
 *                       description:
 *                         type: string
 *                       icon:
 *                         type: string
 *                 main:
 *                   type: object
 *                   properties:
 *                     temp:
 *                       type: number
 *                     feels_like:
 *                       type: number
 *                     temp_min:
 *                       type: number
 *                     temp_max:
 *                       type: number
 *                     pressure:
 *                       type: number
 *                     humidity:
 *                       type: number
 *                 visibility:
 *                   type: number
 *                 wind:
 *                   type: object
 *                   properties:
 *                     speed:
 *                       type: number
 *                     deg:
 *                       type: number
 *                     gust:
 *                       type: number
 *                 clouds:
 *                   type: object
 *                   properties:
 *                     all:
 *                       type: number
 *                 dt:
 *                   type: number
 *                 sys:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: number
 *                     id:
 *                       type: number
 *                     country:
 *                       type: string
 *                     sunrise:
 *                       type: number
 *                     sunset:
 *                       type: number
 *                 timezone:
 *                   type: number
 *                 id:
 *                   type: number
 *                 name:
 *                   type: string
 *                 cod:
 *                   type: number
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */

router.get("/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: city,
        appid: SERVICE_KEY,
        units: "metric", // 섭씨로 온도 표시
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;
