/* eslint-disable no-undef */
import { VisionCameraProxy } from 'react-native-vision-camera';

/**
 * Scans OCR.
 */
const plugin = VisionCameraProxy.initFrameProcessorPlugin('scanOCR');
export function scanOCR(frame) {
  'worklet';

  if (plugin == null) {
    throw new Error('Failed to load Frame Processor Plugin "scanOCR"! Please check your dependencies and make sure that the plugin is linked correctly.');
  }

  return plugin.call(frame);
}
//# sourceMappingURL=index.js.map