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

/**
 * @swagger
 * /schedule/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     description: Retrieve a specific schedule by its ID.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the schedule to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A schedule object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule_id:
 *                   type: integer
 *                   description: ID of the schedule
 *                 schedule_title:
 *                   type: string
 *                   description: Title of the schedule
 *                 schedule_description:
 *                   type: string
 *                   description: Description of the schedule
 *                 schedule_start:
 *                   type: string
 *                   format: date-time
 *                   description: Start time of the schedule
 *                 schedule_end:
 *                   type: string
 *                   format: date-time
 *                   description: End time of the schedule
 *                 schedule_notification:
 *                   type: boolean
 *                   description: Whether the schedule has a notification
 *                 schedule_recurring:
 *                   type: boolean
 *                   description: Whether the schedule is recurring
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */
const getScheduleById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    const [schedule] = await connection.query(
      "SELECT * FROM schedule WHERE schedule_id = ?",
      [id]
    );

    connection.release();

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const formatDateToKST = (dateString) => {
      const date = new Date(dateString);
      const kstOffset = 9 * 60; // 한국 표준시는 UTC보다 9시간 빠릅니다.
      const kstDate = new Date(date.getTime() + kstOffset * 60000);
      return kstDate.toISOString().slice(0, 19).replace("T", " ");
    };

    const formattedSchedule = {
      ...schedule,
      schedule_start: formatDateToKST(new Date(schedule.schedule_start)),
      schedule_end: formatDateToKST(new Date(schedule.schedule_end)),
      schedule_notification: !!schedule.schedule_notification,
      schedule_recurring: !!schedule.schedule_recurring,
    };

    res.json(formattedSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getSchedules, getScheduleById };
