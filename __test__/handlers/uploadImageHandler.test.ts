import { Request, Response } from "express";
import { uploadImageHandler } from "#handlers/uploadImageHandler";
import { checkDuplicateReading } from "#usecases/checkDuplicateReading";
import { extractMeasurement } from "#usecases/extractMeasurement";
import { addImage } from "#utils/tempImagesStore";
import { storeMeasurement } from "#usecases/storeMeasurement";

jest.mock("#usecases/checkDuplicateReading");
jest.mock("#usecases/extractMeasurement");
jest.mock("#utils/tempImagesStore");
jest.mock("#usecases/storeMeasurement");

describe("uploadImageHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return 400 if request body is invalid", () => {
    req.body = {
      image: "invalid_base64_string",
      customer_code: "",
      measure_datetime: "invalid_date",
      measure_type: "INVALID_TYPE",
    };

    uploadImageHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "INVALID_DATA",
      error_description: expect.any(String),
    });
  });

  it("should return 409 if duplicate reading is found", () => {
    req.body = {
      image: "aGVsbG8gd29ybGQ=",
      customer_code: "12345",
      measure_datetime: "2024-08-30T10:00:00Z",
      measure_type: "WATER",
    };
    (checkDuplicateReading as jest.Mock).mockReturnValue(true);

    uploadImageHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error_code: "DOUBLE_REPORT",
      error_description: "Leitura do mês já realizada.",
    });
  });

  it("should process valid request and return 200", () => {
    req.body = {
      image: "aGVsbG8gd29ybGQ=",
      customer_code: "12345",
      measure_datetime: "2024-08-30T10:00:00Z",
      measure_type: "WATER",
    };
    (checkDuplicateReading as jest.Mock).mockReturnValue(false);
    (extractMeasurement as jest.Mock).mockReturnValue(42);

    uploadImageHandler(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      image_url: expect.any(String),
      measurement_value: 42,
      measure_uuid: expect.any(String),
    });

    expect(addImage).toHaveBeenCalledWith(expect.any(String), req.body.image);
    expect(storeMeasurement).toHaveBeenCalledWith(req.body.customer_code, expect.any(Object));
  });
});
