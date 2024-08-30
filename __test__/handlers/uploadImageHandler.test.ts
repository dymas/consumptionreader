import request from "supertest";
import express from "express";
import { uploadImageHandler } from "#handlers/uploadImageHandler";
import { checkDuplicateReading } from "#usecases/checkDuplicateReading";
import { extractMeasurement } from "#usecases/extractMeasurement";
import { addImage } from "#utils/tempImagesStore";
import { storeMeasurement } from "#usecases/storeMeasurement";

const app = express();
app.use(express.json());
app.post("/upload", uploadImageHandler);

jest.mock("#usecases/checkDuplicateReading");
jest.mock("#usecases/extractMeasurement");
jest.mock("#utils/tempImagesStore");
jest.mock("#usecases/storeMeasurement");

describe("uploadImageHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if request body is invalid", async () => {
    const response = await request(app).post("/upload").send({
      image: "invalid_base64_image",
      customer_code: "",
      measure_datetime: "2024-08-30T10:00:00Z",
      measure_type: "WATER",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error_code: "INVALID_DATA",
      error_description: "Imagem deve ser uma string base64",
    });
  });

  it("should return 409 if a duplicate reading is found", async () => {
    (checkDuplicateReading as jest.Mock).mockResolvedValue(true);

    const response = await request(app).post("/upload").send({
      image: "aGVsbG8gd29ybGQ=",
      customer_code: "customer123",
      measure_datetime: "2024-08-30T10:00:00Z",
      measure_type: "WATER",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error_code: "DOUBLE_REPORT",
      error_description: "Leitura do mês já realizada.",
    });
  });

  it("should return 200 on success", async () => {
    (checkDuplicateReading as jest.Mock).mockResolvedValue(false);
    (extractMeasurement as jest.Mock).mockResolvedValue(10);
    (storeMeasurement as jest.Mock).mockResolvedValue(true);
    (addImage as jest.Mock).mockImplementation(() => {});

    const response = await request(app).post("/upload").send({
      image: "aGVsbG8gd29ybGQ=",
      customer_code: "customer123",
      measure_datetime: "2024-08-30T10:00:00Z",
      measure_type: "WATER",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      image_url: expect.stringMatching(/^\/image\/[a-f0-9\-]{36}$/),
      measurement_value: 10,
      measure_uuid: expect.any(String),
    });
    expect(addImage).toHaveBeenCalledWith(
      expect.any(String),
      "aGVsbG8gd29ybGQ="
    );
    expect(storeMeasurement).toHaveBeenCalledWith(
      "customer123",
      expect.objectContaining({
        measure_uuid: expect.any(String),
        measure_datetime: "2024-08-30T10:00:00Z",
        measure_type: "WATER",
        has_confirmed: false,
        image_url: expect.stringMatching(/^\/image\/[a-f0-9\-]{36}$/),
      })
    );
  });
});
