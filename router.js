import express from "express";
import scheduleController from "./routes/apis/schedule.controller.js";
import scheduleAdminController from "./routes/apis/scheduleAdmin.controller.js";

const router = express.Router();

// 스케줄 관련 API 라우팅
router.get("/schedules", scheduleController.getSchedules);
router.get("/schedule/:id", scheduleController.getScheduleById);
router.post("/schedule", scheduleAdminController.createSchedule);
router.delete("/schedule/:id", scheduleAdminController.deleteSchedule);
router.put("/schedule/:id", scheduleAdminController.updateSchedule);

export default router;
