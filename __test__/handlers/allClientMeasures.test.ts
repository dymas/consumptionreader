// allClientMeasuresHandler.test.ts
import { Request, Response } from "express";
import { allClientMeasuresHandler } from "#handlers/allClientMeasures";
import { getMeasurementsByCustomerCode } from "#usecases/getMeasurementsByCustomerCode";

jest.mock("#usecases/getMeasurementsByCustomerCode");

describe("allClientMeasuresHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 400 if measure type is invalid", async () => {
    req.params.customer_code = "12345";
    req.query.measure_type = "INVALID_TYPE";

    await allClientMeasuresHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  });

  it("should return 404 if no measures are found", async () => {
    req.params.customer_code = "12345";
    req.query.measure_type = "WATER";

    (getMeasurementsByCustomerCode as jest.Mock).mockResolvedValue(null);

    await allClientMeasuresHandler(req as Request, res as Response);

    expect(getMeasurementsByCustomerCode).toHaveBeenCalledWith("12345", [
      "WATER",
    ]);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  });

  it("should return 200 on success", async () => {
    req.params.customer_code = "12345";
    req.query.measure_type = "GAS";

    const mockMeasures = [
      {
        measure_uuid: "uuid1",
        measure_datetime: "2024-08-30T12:00:00Z",
        measure_type: "GAS",
        has_confirmed: false,
        image_url: "/image/uuid1",
      },
      {
        measure_uuid: "uuid2",
        measure_datetime: "2024-08-30T13:00:00Z",
        measure_type: "GAS",
        has_confirmed: true,
        image_url: "/image/uuid2",
      },
    ];

    (getMeasurementsByCustomerCode as jest.Mock).mockResolvedValue(
      mockMeasures
    );

    await allClientMeasuresHandler(req as Request, res as Response);

    expect(getMeasurementsByCustomerCode).toHaveBeenCalledWith("12345", [
      "GAS",
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      customer_code: "12345",
      measures: mockMeasures,
    });
  });

  it("should return 500 on error", async () => {
    req.params.customer_code = "12345";
    req.query.measure_type = "WATER";

    (getMeasurementsByCustomerCode as jest.Mock).mockRejectedValue(
      new Error("Server Error")
    );

    await allClientMeasuresHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "SERVER_ERROR",
      error_description:
        "Erro ao processar a requisição. Tente novamente mais tarde.",
    });
  });
});
