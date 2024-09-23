// import pool from "../../DB/db.js";
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
 * /schedule:
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
 *                 description: Start time of the schedule (ISO 8601 format)
 *               schedule_end:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the schedule (ISO 8601 format)
 *     responses:
 *       201:
 *         description: Schedule created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 schedule_id:
 *                   type: string
 *                   description: ID of the created schedule
 */
const createSchedule = async (req, res) => {
  const {
    user_email,
    schedule_title,
    schedule_description,
    schedule_start,
    schedule_end,
  } = req.body;

  try {
    const scheduleRef = db.collection("schedules").doc();
    await scheduleRef.set({
      user_email,
      schedule_title,
      schedule_description,
      schedule_start: formatDateToKST(schedule_start),
      schedule_end: formatDateToKST(schedule_end),
    });

    const schedule_id = scheduleRef.id;

    res.status(201).json({ schedule_id });
  } catch (err) {
    console.error("Error creating schedule:", err);
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the schedule to delete
 *         schema:
 *           type: string
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

  try {
    const scheduleRef = db.collection("schedules").doc(scheduleId);
    const doc = await scheduleRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    await scheduleRef.delete();

    res.status(200).json({
      message: "Schedule deleted successfully",
    });
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the schedule to update
 *         schema:
 *           type: string
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
 *                 description: Start time of the schedule (ISO 8601 format)
 *               schedule_end:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the schedule (ISO 8601 format)
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
  } = req.body;

  try {
    const scheduleRef = db.collection("schedules").doc(scheduleId);
    const doc = await scheduleRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    await scheduleRef.update({
      user_email,
      schedule_title,
      schedule_description,
      schedule_start: formatDateToKST(schedule_start),
      schedule_end: formatDateToKST(schedule_end),
    });

    res.status(200).json({
      message: "Schedule updated successfully",
    });
  } catch (err) {
    console.error("Error updating schedule:", err);
    res.status(500).json({ error: err.message });
  }
};

export default { createSchedule, deleteSchedule, updateSchedule };
