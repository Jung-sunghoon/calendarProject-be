import express from "express";
import scheduleController from "./routes/apis/schedule.controller.js";
import scheduleAdminController from "./routes/apis/scheduleAdmin.controller.js";

const router = express.Router();

// 스케줄 관련 API 라우팅
router.get("/schedules", scheduleController.getSchedules);
router.post("/schedules", scheduleAdminController.createSchedule);
router.delete("/schedules/:id", scheduleAdminController.deleteSchedule);
router.put("/schedules/:id", scheduleAdminController.updateSchedule);

export default router;
