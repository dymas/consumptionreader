export async function getMeasurementByUuid(measure_uuid: string) {
  return {
    measure_uuid,
    measure_datetime: "2022-08-30T10:00:00Z",
    measure_type: "WATER",
    has_confirmed: true,
    image_url: "/image/12345",
  };
}
