import express from "express";
import passport from "passport";
import scheduleController from "./routes/apis/schedule.controller.js";
import scheduleAdminController from "./routes/apis/scheduleAdmin.controller.js";
import weatherController from "./routes/apis/weather.controller.js";
import { isNotLoggedIn, isLoggedIn } from "./routes/middlewares.js";

const router = express.Router();

// 스케줄 관련 API 라우팅
router.get("/schedules", scheduleController.getSchedules);
router.get("/schedule/:id", scheduleController.getScheduleById);
router.post("/schedule", scheduleAdminController.createSchedule);
router.delete("/schedule/:id", scheduleAdminController.deleteSchedule);
router.put("/schedule/:id", scheduleAdminController.updateSchedule);
router.get("/weather", weatherController);

router.get("/user", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.json(req.user);
});

router.post("/logout", isLoggedIn, (req, res) => {
  //   req.logout();
  //   req.session.destroy();
  res.status(200).json({ message: "로그아웃 성공" });
  res.redirect("/");
});
export default router;
