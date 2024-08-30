import { Request, Response } from "express";
import { z } from "zod";
import { checkDuplicateReading } from "#usecases/checkDuplicateReading";
import { extractMeasurement } from "#usecases/extractMeasurement";
import { addImage } from "#utils/tempImagesStore";

const uploadImageRequestBody = z.object({
  image: z
    .string()
    .regex(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, {
      message: "Imagem deve ser uma string base64",
    }),
  customer_code: z
    .string()
    .min(1, "Código do cliente deve ser uma string não vazia"),
  measure_datetime: z.string().datetime(),
  measure_type: z.enum(["WATER", "GAS"]),
});

function uploadImageHandler(req: Request, res: Response) {
  const result = uploadImageRequestBody.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: result.error.errors[0].message,
    });
  }

  const { image, customer_code, measure_datetime, measure_type } = result.data;

  if (checkDuplicateReading(customer_code, measure_type, measure_datetime)) {
    return res.status(409).json({
      error_code: "DOUBLE_REPORT",
      error_description: "Leitura do mês já realizada.",
    });
  }

  const measure_uuid = crypto.randomUUID();
  const measurement_value = extractMeasurement(measure_type, image);
  addImage(measure_uuid, image);

  res.status(200).json({
    image_url: `/image/${measure_uuid}`,
    measurement_value,
    measure_uuid,
  });
}

export { uploadImageRequestBody, uploadImageHandler };
