import express from "express";
import pool from "../../DB/db.js";
import jwt from "jsonwebtoken";
import checkAuthToken from "../../swaggerSecurity.js";
const router = express.Router();

// 권한 확인 미들웨어
const checkScheduleOwnership = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query("SELECT * FROM schedules WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.id,
    ]);
    if (rows.length === 0) {
      return res.status(403).json({ message: "이 일정을 삭제할 권한이 없습니다." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  } finally {
    client.release();
  }
};

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: 일정 삭제
 *     description: 특정 ID의 일정을 삭제합니다.
 *     tags:
 *       - 일정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 삭제할 일정의 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 일정 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 일정이 성공적으로 삭제되었습니다.
 *       401:
 *         description: 인증되지 않은 사용자
 *       403:
 *         description: 권한 없음
 *       404:
 *         description: 일정을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */

router.delete("/schedules/:id", checkAuthToken, checkScheduleOwnership, async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("DELETE FROM schedules WHERE id = $1", [id]);
    res.status(200).json({ message: "일정이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("일정 삭제 중 오류 발생:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  } finally {
    client.release();
  }
});

export default router;
