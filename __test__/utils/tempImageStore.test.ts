import { addImage, getImage, removeImage } from "#utils/tempImagesStore";

jest.useFakeTimers();

describe("tempImageStore", () => {
  const measurement_uuid = "test-uuid";
  const base64_image = "aGVsbG8gd29ybGQ=";
  const bufferImage = Buffer.from(base64_image, "base64");

  afterEach(() => {
    removeImage(measurement_uuid);
  });

  test("addImage should add an base64 image to tempImages", () => {
    addImage(measurement_uuid, base64_image);

    expect(getImage(measurement_uuid)).toEqual(bufferImage);
  });

  test("addImage should remove the image after 5 minutos", () => {
    addImage(measurement_uuid, base64_image);

    expect(getImage(measurement_uuid)).toEqual(bufferImage);

    jest.advanceTimersByTime(300000);

    expect(getImage(measurement_uuid)).toBeUndefined();
  });

  test("getImage should return the correct image", () => {
    addImage(measurement_uuid, base64_image);

    expect(getImage(measurement_uuid)).toEqual(bufferImage);
  });

  test("getImage should return undefined if the image does not exist", () => {
    expect(getImage("invalid-uuid")).toBeUndefined();
  });

  test("removeImage should remove the image", () => {
    addImage(measurement_uuid, base64_image);

    expect(getImage(measurement_uuid)).toEqual(bufferImage);

    removeImage(measurement_uuid);

    expect(getImage(measurement_uuid)).toBeUndefined();
  });
});
