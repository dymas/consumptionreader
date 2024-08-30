interface Measurement {
  measure_uuid: string;
  measure_datetime: string;
  measure_type: string;
  has_confirmed: boolean;
  image_url: string;
}

export function storeMeasurement(customer_code: string, data: Measurement) {
  return true;
}
