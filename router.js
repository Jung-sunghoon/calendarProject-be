import express from "express";
import scheduleController from "./routes/apis/schedule.controller.js";

const router = express.Router();

// 스케줄 관련 API 라우팅
router.get("/schedules", scheduleController.getSchedules);
router.post("/schedules", scheduleController.createSchedule);
// 필요한 다른 엔드포인트를 추가하세요

export default router;
