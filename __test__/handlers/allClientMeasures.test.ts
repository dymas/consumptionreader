import request from "supertest";
import express from "express";
import { allClientMeasuresHandler } from "#handlers/allClientMeasures";
import { getMeasurementsByCustomerCode } from "#usecases/getMeasurementsByCustomerCode";

const app = express();
app.use(express.json());
app.get("/:customer_code/list", allClientMeasuresHandler);

jest.mock("#usecases/getMeasurementsByCustomerCode");

describe("allClientMeasuresHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if measure type is invalid", async () => {
    const response = await request(app).get(
      "/customer123/list?measure_type=INVALID_TYPE"
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  });

  it("should return 404 if no measures are found", async () => {
    (getMeasurementsByCustomerCode as jest.Mock).mockResolvedValue(null);

    const response = await request(app).get("/customer123/list");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  });

  it("should return 200 on success", async () => {
    const mockMeasurements = [
      {
        measure_uuid: "12345",
        measure_datetime: "2022-08-30T10:00:00Z",
        measure_type: "WATER",
        has_confirmed: true,
        image_url: "/image/12345",
      },
    ];

    (getMeasurementsByCustomerCode as jest.Mock).mockResolvedValue(
      mockMeasurements
    );

    const response = await request(app).get(
      "/customer123/list?measure_type=WATER"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      customer_code: "customer123",
      measures: mockMeasurements,
    });
  });
});
