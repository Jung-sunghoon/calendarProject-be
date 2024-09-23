import { db } from "../../DB/db.js";

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
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */

const getSchedules = async (req, res) => {
  try {
    const schedulesSnapshot = await db.collection("schedules").get(); // db 인스턴스를 사용
    const schedules = schedulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      schedule_start: formatDateToKST(schedule.schedule_start),
      schedule_end: formatDateToKST(schedule.schedule_end),
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
 *       404:
 *         description: Schedule not found
 *       500:
 *         description: Server error
 */

const getScheduleById = async (req, res) => {
  const { id } = req.params;
  try {
    const scheduleDoc = await db.collection("schedules").doc(id).get();

    if (!scheduleDoc.exists) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const schedule = scheduleDoc.data();

    const formattedSchedule = {
      ...schedule,
      schedule_start: formatDateToKST(schedule.schedule_start),
      schedule_end: formatDateToKST(schedule.schedule_end),
    };

    res.json(formattedSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getSchedules, getScheduleById };
