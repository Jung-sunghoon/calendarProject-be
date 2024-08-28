import pool from "../../DB/db.js";

const formatDateToKST = (dateString) => {
  const date = new Date(dateString);
  const kstOffset = 9 * 60;
  const kstDate = new Date(date.getTime() + kstOffset * 60000);
  return kstDate.toISOString().slice(0, 19).replace("T", " ");
};

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
 *                   recurring_pattern:
 *                     type: object
 *                     properties:
 *                       repeat_type:
 *                         type: string
 *                         description: Type of recurrence (daily, weekly, etc.)
 *                       repeat_interval:
 *                         type: integer
 *                         description: Interval of recurrence
 *                       repeat_on:
 *                         type: string
 *                         description: Days of the week/month for recurrence (JSON format)
 *                       starts_on:
 *                         type: string
 *                         format: date
 *                         description: Start date of recurrence
 *                       ends_on:
 *                         type: string
 *                         format: date
 *                         description: End date of recurrence
 */

const getSchedules = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const query = `
      SELECT s.*, rp.repeat_type, rp.repeat_interval, rp.repeat_on, rp.starts_on, rp.ends_on
      FROM schedule s
      LEFT JOIN recurring_pattern rp ON s.schedule_id = rp.schedule_id
    `;
    const schedules = await connection.query(query);
    connection.release();

    const formattedSchedules = schedules.map((schedule) => {
      const recurringPattern = schedule.repeat_type
        ? {
            repeat_type: schedule.repeat_type,
            repeat_interval: schedule.repeat_interval,
            repeat_on: schedule.repeat_on ? schedule.repeat_on : [],
            starts_on: schedule.starts_on,
            ends_on: schedule.ends_on,
          }
        : null;

      // Remove repeating fields from the main object
      const {
        repeat_type,
        repeat_interval,
        repeat_on,
        starts_on,
        ends_on,
        ...scheduleWithoutRepeatingFields
      } = schedule;

      return {
        ...scheduleWithoutRepeatingFields,
        schedule_start: formatDateToKST(schedule.schedule_start),
        schedule_end: formatDateToKST(schedule.schedule_end),
        schedule_notification: !!schedule.schedule_notification,
        schedule_recurring: !!schedule.schedule_recurring,
        recurring_pattern: recurringPattern,
      };
    });

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
 *                 recurring_pattern:
 *                   type: object
 *                   properties:
 *                     repeat_type:
 *                       type: string
 *                       description: Type of recurrence (daily, weekly, etc.)
 *                     repeat_interval:
 *                       type: integer
 *                       description: Interval of recurrence
 *                     repeat_on:
 *                       type: string
 *                       description: Days of the week/month for recurrence (JSON format)
 *                     starts_on:
 *                       type: string
 *                       format: date
 *                       description: Start date of recurrence
 *                     ends_on:
 *                       type: string
 *                       format: date
 *                       description: End date of recurrence
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */

const getScheduleById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    const query = `
      SELECT s.*, rp.repeat_type, rp.repeat_interval, rp.repeat_on, rp.starts_on, rp.ends_on
      FROM schedule s
      LEFT JOIN recurring_pattern rp ON s.schedule_id = rp.schedule_id
      WHERE s.schedule_id = ?
    `;
    const schedules = await connection.query(query, [id]);
    connection.release();

    if (schedules.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const schedule = schedules[0];

    const recurringPattern = schedule.repeat_type
      ? {
          repeat_type: schedule.repeat_type,
          repeat_interval: schedule.repeat_interval,
          repeat_on: schedule.repeat_on ? schedule.repeat_on : [],
          starts_on: schedule.starts_on,
          ends_on: schedule.ends_on,
        }
      : null;

    const {
      repeat_type,
      repeat_interval,
      repeat_on,
      starts_on,
      ends_on,
      ...scheduleWithoutRepeatingFields
    } = schedule;

    const formattedSchedule = {
      ...scheduleWithoutRepeatingFields,
      schedule_start: formatDateToKST(schedule.schedule_start),
      schedule_end: formatDateToKST(schedule.schedule_end),
      schedule_notification: !!schedule.schedule_notification,
      schedule_recurring: !!schedule.schedule_recurring,
      recurring_pattern: recurringPattern,
    };

    res.json(formattedSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getSchedules, getScheduleById };
