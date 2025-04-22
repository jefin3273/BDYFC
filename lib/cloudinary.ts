export async function uploadToCloudinary(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "bdyfc_uploads")
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "")

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    )

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw error
  }
}

export function getCloudinaryUrl(publicId: string, options = {}) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    throw new Error("Cloudinary cloud name is not defined")
  }

  const defaultOptions = {
    width: 800,
    crop: "fill",
    quality: "auto",
    format: "auto",
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const transformations = Object.entries(mergedOptions)
    .map(([key, value]) => `${key}_${value}`)
    .join(",")

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`
}
