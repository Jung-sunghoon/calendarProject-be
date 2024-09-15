import pool from "../../DB/db.js";

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Schedule management
 */

/**
 * @swagger
 * /schedule:
 *   post:
 *     summary: Create a new schedule
 *     description: Create a new schedule in the calendar.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
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
    user_email,
    schedule_title,
    schedule_description,
    schedule_start,
    schedule_end,
    schedule_notification,
    schedule_recurring,
  } = req.body;
  try {
    // mysql이 요구하는 날짜 형식으로 변환
    const formatDateToKST = (dateString) => {
      const date = new Date(dateString);
      const kstOffset = 9 * 60; // 한국 표준시는 UTC보다 9시간 빠릅니다.
      const kstDate = new Date(date.getTime() + kstOffset * 60000);
      return kstDate.toISOString().slice(0, 19).replace("T", " ");
    };

    const formattedStart = formatDateToKST(schedule_start);
    const formattedEnd = formatDateToKST(schedule_end);

    const connection = await pool.getConnection();
    const result = await connection.query(
      "INSERT INTO schedule (user_email, schedule_title, schedule_description, schedule_start, schedule_end, schedule_notification, schedule_recurring) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user_email,
        schedule_title,
        schedule_description,
        formattedStart,
        formattedEnd,
        schedule_notification,
        schedule_recurring,
      ]
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
 * /schedule/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     description: Delete an existing schedule from the calendar.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
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

/**
 * @swagger
 * /schedule/{id}:
 *   put:
 *     summary: Update a schedule
 *     description: Update an existing schedule in the calendar.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the schedule to update
 *         schema:
 *           type: integer
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
 *       200:
 *         description: Schedule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       400:
 *         description: Invalid schedule ID or request data
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Internal server error
 */
const updateSchedule = async (req, res) => {
  const scheduleId = req.params.id;
  const {
    user_email,
    schedule_title,
    schedule_description,
    schedule_start,
    schedule_end,
    schedule_notification,
    schedule_recurring,
  } = req.body;

  // scheduleId의 유효성 검사
  if (!scheduleId || isNaN(scheduleId)) {
    return res.status(400).json({ error: "Invalid schedule ID" });
  }

  // 요청 바디의 필수 필드 유효성 검사
  if (
    !schedule_title ||
    !schedule_description ||
    !schedule_start ||
    !schedule_end ||
    typeof schedule_notification !== "boolean" ||
    typeof schedule_recurring !== "boolean"
  ) {
    return res.status(400).json({ error: "Missing or invalid request data" });
  }

  try {
    // 날짜 형식 변환 함수
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
      return date.toISOString().slice(0, 19).replace("T", " ");
    };

    const formattedStart = formatDate(schedule_start);
    const formattedEnd = formatDate(schedule_end);

    const connection = await pool.getConnection();
    const result = await connection.query(
      "UPDATE schedule SET user_email = ?, schedule_title = ?, schedule_description = ?, schedule_start = ?, schedule_end = ?, schedule_notification = ?, schedule_recurring = ? WHERE schedule_id = ?",
      [
        user_email,
        schedule_title,
        schedule_description,
        formattedStart,
        formattedEnd,
        schedule_notification,
        schedule_recurring,
        scheduleId,
      ]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(200).json({
      message: "Schedule updated successfully",
    });
  } catch (err) {
    console.error("Error updating schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

export default { createSchedule, deleteSchedule, updateSchedule };
