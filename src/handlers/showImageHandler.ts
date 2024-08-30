import { Request, Response } from "express";
import { getImage } from "#utils/tempImagesStore";

function showImageHandler(req: Request, res: Response) {
  const image = getImage(req.params.id);

  if (image) {
    res.set("Content-Type", "image/png");
    res.send(image);
  } else {
    res.status(404).send("Imagem não encontrada");
  }
}

export { showImageHandler };
