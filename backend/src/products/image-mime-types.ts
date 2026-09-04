import { ImageExtension } from './enums/image-extension.enum';

export const EXTENSION_TO_MIME_TYPE: Record<ImageExtension, string> = {
  [ImageExtension.JPG]: 'image/jpeg',
  [ImageExtension.PNG]: 'image/png',
  [ImageExtension.WEBP]: 'image/webp',
};

export const MIME_TYPE_TO_EXTENSION: Record<string, ImageExtension> = {
  'image/jpeg': ImageExtension.JPG,
  'image/png': ImageExtension.PNG,
  'image/webp': ImageExtension.WEBP,
};
