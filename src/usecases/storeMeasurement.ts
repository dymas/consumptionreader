import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Measurement {
  measure_uuid: string;
  measure_datetime: string;
  measure_type: string;
  has_confirmed: boolean;
  image_url: string;
}

export async function storeMeasurement(customer_code: string, data: Measurement) {
  try {
    const newMeasurement = await prisma.measurement.create({
      data: {
        customer_code,
        measure_uuid: data.measure_uuid,
        measure_datetime: new Date(data.measure_datetime),
        measure_type: data.measure_type as "WATER" | "GAS", 
        has_confirmed: data.has_confirmed,
        image_url: data.image_url,
      },
    });

    console.log("Measurement stored successfully:", newMeasurement);
    return true;
  } catch (error) {
    console.error("Error storing measurement:", error);
    return false;
  }
}
