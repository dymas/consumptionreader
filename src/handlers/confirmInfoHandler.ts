import { z } from "zod";
import { Request, Response } from "express";
import { getMeasurementByUuid } from "#usecases/getMeasurementByUuid";
import { confirmMeasurement } from "#usecases/confirmMeasurement";

const confirmInfoRequestBody = z.object({
  measure_uuid: z.string().uuid("O código de leitura deve ser um UUID válido."),
  confirmed_value: z.number().int("O valor confirmado deve ser um número inteiro.")
});

export async function confirmInfoHandler(req: Request, res: Response) {
  const result = confirmInfoRequestBody.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: result.error.errors[0].message,
    });
  }

  const { measure_uuid, confirmed_value } = result.data;

  try {
    const measurement = await getMeasurementByUuid(measure_uuid);
    
    if (!measurement) {
      return res.status(404).json({
        error_code: "MEASURE_NOT_FOUND",
        error_description: "Código de leitura não encontrado."
      });
    }

    if (measurement.has_confirmed) {
      return res.status(409).json({
        error_code: "CONFIRMATION_DUPLICATE",
        error_description: "Leitura já confirmada."
      });
    }

    await confirmMeasurement(measure_uuid, confirmed_value);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro ao confirmar a leitura:", error);
    return res.status(500).json({
      error_code: "SERVER_ERROR",
      error_description: "Erro ao processar a requisição. Tente novamente mais tarde."
    });
  }
}
