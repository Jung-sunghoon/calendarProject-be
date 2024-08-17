import pool from "../../DB/db.js";

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     description: Retrieve a list of all schedules from the calendar.
 *     tags: [Schedules]
 *     responses:
 *       200:
 *         description: A list of schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   schedule_id:
 *                     type: integer
 *                     description: ID of the schedule
 *                   schedule_title:
 *                     type: string
 *                     description: Title of the schedule
 *                   schedule_description:
 *                     type: string
 *                     description: Description of the schedule
 *                   schedule_start:
 *                     type: string
 *                     format: date-time
 *                     description: Start time of the schedule
 *                   schedule_end:
 *                     type: string
 *                     format: date-time
 *                     description: End time of the schedule
 *                   schedule_notification:
 *                     type: boolean
 *                     description: Whether the schedule has a notification
 *                   schedule_recurring:
 *                     type: boolean
 *                     description: Whether the schedule is recurring
 */
const getSchedules = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const schedules = await connection.query("SELECT * FROM schedule");

    connection.release();

    const formatDateToKST = (dateString) => {
      const date = new Date(dateString);
      const kstOffset = 9 * 60; // 한국 표준시는 UTC보다 9시간 빠릅니다.
      const kstDate = new Date(date.getTime() + kstOffset * 60000);
      return kstDate.toISOString().slice(0, 19).replace("T", " ");
    };

    // Boolean 값을 올바르게 변환하고, 시간 값을 로컬 타임존으로 변환하여 응답
    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      schedule_start: formatDateToKST(new Date(schedule.schedule_start)),
      schedule_end: formatDateToKST(new Date(schedule.schedule_end)),
      schedule_notification: !!schedule.schedule_notification,
      schedule_recurring: !!schedule.schedule_recurring,
    }));

    res.json(formattedSchedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getSchedules };
