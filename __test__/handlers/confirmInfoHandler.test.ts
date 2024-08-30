import request from "supertest";
import express from "express";
import { confirmInfoHandler } from "#handlers/confirmInfoHandler";
import { getMeasurementByUuid } from "#usecases/getMeasurementByUuid";
import { confirmMeasurement } from "#usecases/confirmMeasurement";

const app = express();
app.use(express.json());
app.post("/confirm", confirmInfoHandler);

jest.mock("#usecases/getMeasurementByUuid");
jest.mock("#usecases/confirmMeasurement");

describe("confirmInfoHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if request body is invalid", async () => {
    const response = await request(app).post("/confirm").send({
      measure_uuid: "invalid-uuid",
      confirmed_value: "not-an-integer",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error_code: "INVALID_DATA",
      error_description: "O código de leitura deve ser um UUID válido.",
    });
  });

  it("should return 404 if measurement is not found", async () => {
    (getMeasurementByUuid as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/confirm").send({
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 10,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error_code: "MEASURE_NOT_FOUND",
      error_description: "Código de leitura não encontrado.",
    });
  });

  it("should return 409 if measurement has already been confirmed", async () => {
    (getMeasurementByUuid as jest.Mock).mockResolvedValue({
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      has_confirmed: true,
    });

    const response = await request(app).post("/confirm").send({
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 10,
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error_code: "CONFIRMATION_DUPLICATE",
      error_description: "Leitura já confirmada.",
    });
  });

  it("should return 200 on success", async () => {
    (getMeasurementByUuid as jest.Mock).mockResolvedValue({
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      has_confirmed: false,
    });
    (confirmMeasurement as jest.Mock).mockResolvedValue(true);

    const response = await request(app).post("/confirm").send({
      measure_uuid: "123e4567-e89b-12d3-a456-426614174000",
      confirmed_value: 10,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(confirmMeasurement).toHaveBeenCalledWith(
      "123e4567-e89b-12d3-a456-426614174000"
    );
  });
});
