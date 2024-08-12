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
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     description: Create a new schedule in the calendar.
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule_title:
 *                 type: string
 *                 description: Title of the schedule
 *               schedule_description:
 *                 type: string
 *                 description: Description of the schedule
 *               schedule_start:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the schedule (ISO 8601 format, e.g. "2024-08-12T16:00:11.158Z")
 *               schedule_end:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the schedule (ISO 8601 format, e.g. "2024-08-12T16:00:11.158Z")
 *               schedule_notification:
 *                 type: boolean
 *                 description: Whether the schedule has a notification
 *               schedule_recurring:
 *                 type: boolean
 *                 description: Whether the schedule is recurring
 *     responses:
 *       201:
 *         description: Schedule created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule_id:
 *                   type: integer
 *                   description: ID of the created schedule
 */
const createSchedule = async (req, res) => {
  const {
    schedule_title,
    schedule_description,
    schedule_start,
    schedule_end,
    schedule_notification,
    schedule_recurring,
  } = req.body;
  try {
    // mysql이 요구하는 날짜 형식으로 변환
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace("T", " ");
    };

    const formattedStart = formatDate(schedule_start);
    const formattedEnd = formatDate(schedule_end);

    const connection = await pool.getConnection();
    const result = await connection.query(
      "INSERT INTO schedule (schedule_title, schedule_description, schedule_start, schedule_end, schedule_notification, schedule_recurring) VALUES (?, ?, ?, ?, ?, ?)",
      [schedule_title, schedule_description, formattedStart, formattedEnd, schedule_notification, schedule_recurring]
    );
    connection.release();

    const schedule_id = result.insertId.toString();

    res.status(201).json({ schedule_id });
  } catch (err) {
    console.error("error creating schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     description: Delete an existing schedule from the calendar.
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the schedule to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
const deleteSchedule = async (req, res) => {
  const scheduleId = req.params.id;

  // scheduleId의 유효성 검사
  if (!scheduleId || isNaN(scheduleId)) {
    return res.status(400).json({ error: "Invalid schedule ID" });
  }

  try {
    const connection = await pool.getConnection();

    //트랜잭션 시작
    await connection.beginTransaction();
    try {
      //연관된 반복 패턴 삭제
      await connection.query("DELETE FROM recurring_pattern WHERE schedule_id = ?", [scheduleId]);

      const result = await connection.query("DELETE FROM schedule WHERE schedule_id = ?", [scheduleId]);

      //트랜잭션 커밋
      await connection.commit();

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      res.status(200).json({
        message: "Schedule and associated data deleted successfully",
      });
    } catch (err) {
      //오류발생시 롤백
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

export default { getSchedules, createSchedule, deleteSchedule };
