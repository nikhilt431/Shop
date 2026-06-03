export type StoredUpload = {
  url: string;
  storageKey: string;
};

export async function uploadRepairPhoto(file: File, ticketNumber: string): Promise<StoredUpload> {
  const provider = process.env.STORAGE_PROVIDER ?? "local-placeholder";

  if (provider === "cloudinary" && process.env.CLOUDINARY_CLOUD_NAME) {
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "repair-shop");
    form.append("folder", `repair-jobs/${ticketNumber}`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      throw new Error("Photo upload failed");
    }

    const data = (await response.json()) as { secure_url: string; public_id: string };
    return { url: data.secure_url, storageKey: data.public_id };
  }

  return {
    url: "/placeholder-repair-photo.svg",
    storageKey: `placeholder/${ticketNumber}/${file.name}`
  };
}
