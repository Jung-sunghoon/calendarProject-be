import express from "express";
import pool from "../../DB/db.js";
const router = express.Router();

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: 새 일정 생성
 *     description: 새로운 일정을 생성하고, 필요한 경우 반복 패턴을 설정합니다.
 *     tags:
 *       - 일정
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedule_title
 *               - schedule_start
 *               - schedule_end
 *             properties:
 *               schedule_title:
 *                 type: string
 *                 description: 일정 제목
 *               schedule_description:
 *                 type: string
 *                 description: 일정 설명
 *               schedule_start:
 *                 type: string
 *                 format: date-time
 *                 description: 일정 시작 시간
 *               schedule_end:
 *                 type: string
 *                 format: date-time
 *                 description: 일정 종료 시간
 *               schedule_notification:
 *                 type: boolean
 *                 description: 알림 설정 여부
 *               is_recurring:
 *                 type: boolean
 *                 description: 반복 일정 여부
 *               recurring_pattern:
 *                 type: object
 *                 description: 반복 패턴 정보
 *                 properties:
 *                   repeat_type:
 *                     type: string
 *                     enum: [daily, weekly, monthly, yearly]
 *                     description: 반복 유형
 *                   repeat_interval:
 *                     type: integer
 *                     description: 반복 간격
 *                   repeat_on:
 *                     type: object
 *                     description: 반복 세부 설정 (JSON 형식)
 *                   starts_on:
 *                     type: string
 *                     format: date
 *                     description: 반복 시작일
 *                   ends_on:
 *                     type: string
 *                     format: date
 *                     description: 반복 종료일
 *     responses:
 *       '201':
 *         description: 일정 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 schedule_id:
 *                   type: integer
 *       '400':
 *         description: 잘못된 요청
 *       '500':
 *         description: 서버 오류
 */
router.post("/schedules", async (req, res) => {
  try {
    const {
      schedule_title,
      schedule_description,
      schedule_start,
      schedule_end,
      schedule_notification,
      is_recurring,
      recurring_pattern,
    } = req.body;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 일정 생성
      const scheduleResult = await client.query(
        "INSERT INTO schedule (schedule_title, schedule_description, schedule_start, schedule_end, schedule_notification, is_recurring) VALUES ($1, $2, $3, $4, $5, $6) RETURNING schedule_id",
        [schedule_title, schedule_description, schedule_start, schedule_end, schedule_notification, is_recurring]
      );

      const scheduleId = scheduleResult.rows[0].schedule_id;

      // 반복 패턴이 있는 경우 처리
      if (is_recurring && recurring_pattern) {
        const { repeat_type, repeat_interval, repeat_on, starts_on, ends_on } = recurring_pattern;

        await client.query(
          "INSERT INTO recurring_pattern (schedule_id, repeat_type, repeat_interval, repeat_on, starts_on, ends_on) VALUES ($1, $2, $3, $4, $5, $6)",
          [scheduleId, repeat_type, repeat_interval, JSON.stringify(repeat_on), starts_on, ends_on]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({ message: "일정이 생성되었습니다.", schedule_id: scheduleId });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("일정 생성 오류:", error);
    res.status(500).json({ error: "일정 생성 중 오류가 발생했습니다." });
  }
});

export default router;
