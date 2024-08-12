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
 *                 description: Start time of the schedule
 *               schedule_end:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the schedule
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
    const connection = await pool.getConnection();
    const result = await connection.query(
      "INSERT INTO schedule (schedule_title, schedule_description, schedule_start, schedule_end, schedule_notification, schedule_recurring) VALUES (?, ?, ?, ?, ?, ?)",
      [
        schedule_title,
        schedule_description,
        schedule_start,
        schedule_end,
        schedule_notification,
        schedule_recurring,
      ]
    );
    connection.release();
    res.status(201).json({ schedule_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getSchedules, createSchedule };
