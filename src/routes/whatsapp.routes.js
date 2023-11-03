import { Router } from "express";
import { postwp } from "../controlers/whatsapp.controler.js";

const router = Router();



router.post("/wp", postwp);



export default router;
