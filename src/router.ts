import { Router } from "express";
import { confirmInfoHandler } from "#handlers/confirmInfoHandler";
import { uploadImageHandler } from "#handlers/uploadImageHandler";
import { allClientMeasuresHandler } from "#handlers/allClientMeasures";
import { showImageHandler } from "#handlers/showImageHandler";

const router = Router();

router.post("/upload", uploadImageHandler);
router.patch("/confirm", confirmInfoHandler);
router.get("/:customer_code/list", allClientMeasuresHandler);
router.get("/image/:id", showImageHandler);

export { router };