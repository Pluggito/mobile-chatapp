import { generateReactNativeHelpers } from "@uploadthing/expo";

const url = process.env.EXPO_PUBLIC_API_URL || 'http://172.20.10.3:3008';

export const { useUploadThing, uploadFiles, useImageUploader } = generateReactNativeHelpers({
  url: `${url}/api/uploadthing`,
});
