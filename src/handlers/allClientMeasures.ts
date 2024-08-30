import { Request, Response } from "express";
import { getMeasurementsByCustomerCode } from "#usecases/getMeasurementsByCustomerCode";

export async function allClientMeasuresHandler(req: Request, res: Response) {
  const customer_code = req.params.customer_code;
  const measure_type = req.query.measure_type as string | undefined;
  const valid_measure_types = ["WATER", "GAS"];

  if (measure_type !== undefined) {
    if (!valid_measure_types.includes(measure_type.toUpperCase())) {
      return res.status(400).json({
        error_code: "INVALID_TYPE",
        error_description: "Tipo de medição não permitida",
      });
    }
  }

  try {
    const measures = await getMeasurementsByCustomerCode(
      customer_code,
      measure_type?.toUpperCase()
    );

    if (!measures) {
      return res.status(404).json({
        error_code: "MEASURES_NOT_FOUND",
        error_description: "Nenhuma leitura encontrada",
      });
    }

    return res.status(200).json({
      customer_code: customer_code,
      measures: measures,
    });
  } catch (error) {
    console.error("Erro ao buscar medições:", error);
    return res.status(500).json({
      error_code: "SERVER_ERROR",
      error_description:
        "Erro ao processar a requisição. Tente novamente mais tarde.",
    });
  }
}
