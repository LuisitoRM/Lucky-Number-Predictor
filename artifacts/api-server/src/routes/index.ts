import { Router, type IRouter } from "express";
import healthRouter from "./health";
import lotteryRouter from "./lottery";
import jackpotsRouter from "./jackpots";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jackpotsRouter);
router.use(lotteryRouter);

export default router;
