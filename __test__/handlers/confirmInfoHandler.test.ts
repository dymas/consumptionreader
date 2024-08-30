// confirmInfoHandler.test.ts
import { Request, Response } from "express";
import { confirmInfoHandler } from "#handlers/confirmInfoHandler";
import { getMeasurementByUuid } from "#usecases/getMeasurementByUuid";
import { confirmMeasurement } from "#usecases/confirmMeasurement";

jest.mock("#usecases/getMeasurementByUuid");
jest.mock("#usecases/confirmMeasurement");

describe("confirmInfoHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("should return 400 if request body is invalid", async () => {
    req.body = {
      measure_uuid: "invalid-uuid",
      confirmed_value: "not-an-integer",
    };

    await confirmInfoHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "INVALID_DATA",
      error_description: expect.any(String),
    });
  });

  it("should return 404 if measurement is not found", async () => {
    (getMeasurementByUuid as jest.Mock).mockResolvedValue(null);

    req.body = {
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 100,
    };

    await confirmInfoHandler(req as Request, res as Response);

    expect(getMeasurementByUuid).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "MEASURE_NOT_FOUND",
      error_description: "Código de leitura não encontrado.",
    });
  });

  it("should return 409 if measurement has already been confirmed", async () => {
    (getMeasurementByUuid as jest.Mock).mockResolvedValue({
      has_confirmed: true,
    });

    req.body = {
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 100,
    };

    await confirmInfoHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "CONFIRMATION_DUPLICATE",
      error_description: "Leitura já confirmada.",
    });
  });

  it("should return 200 on success", async () => {
    (getMeasurementByUuid as jest.Mock).mockResolvedValue({
      has_confirmed: false,
    });
    (confirmMeasurement as jest.Mock).mockResolvedValue(undefined);

    req.body = {
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 100,
    };

    await confirmInfoHandler(req as Request, res as Response);

    expect(confirmMeasurement).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000",
      100
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("should return 500 on error", async () => {
    (getMeasurementByUuid as jest.Mock).mockRejectedValue(
      new Error("Server Error")
    );

    req.body = {
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 100,
    };

    await confirmInfoHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "SERVER_ERROR",
      error_description:
        "Erro ao processar a requisição. Tente novamente mais tarde.",
    });
  });
});
