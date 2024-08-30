import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function confirmMeasurement(measure_uuid: string) {
  try {
    const updatedMeasurement = await prisma.measurement.update({
      where: {
        measure_uuid: measure_uuid,
      },
      data: {
        has_confirmed: true,
      },
    });

    return updatedMeasurement;
  } catch (error) {
    console.error("Erro ao confirmar a medição:", error);
    throw new Error("Erro ao confirmar a medição");
  }
}
