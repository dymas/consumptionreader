const tempImages = {};

function addImage(measurement_uuid: string, image: string) {
  tempImages[measurement_uuid] = Buffer.from(image, "base64");

  setTimeout(() => {
    removeImage(measurement_uuid);
  }, 300000);
}

function getImage(measurement_id: string) {
  return tempImages[measurement_id];
}
;
function removeImage(measurement_id: string) {
  delete tempImages[measurement_id];
}

export { addImage, getImage, removeImage };
