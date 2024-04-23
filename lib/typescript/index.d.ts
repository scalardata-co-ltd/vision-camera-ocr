import { Frame } from 'react-native-vision-camera';
type BoundingFrame = {
    x: number;
    y: number;
    width: number;
    height: number;
    boundingCenterX: number;
    boundingCenterY: number;
};
type BoundingBox = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
type Point = {
    x: number;
    y: number;
};
type Symbol = {
    text: string;
    cornerPoints?: Point[];
    frame?: BoundingFrame;
    boundingBox?: BoundingBox;
};
type TextElement = {
    text: string;
    frame?: BoundingFrame;
    boundingBox?: BoundingBox;
    cornerPoints?: Point[];
    symbols?: Symbol[];
};
type TextLine = {
    text: string;
    elements: TextElement[];
    frame?: BoundingFrame;
    boundingBox?: BoundingBox;
    recognizedLanguages: string[];
    cornerPoints?: Point[];
};
type TextBlock = {
    text: string;
    lines: TextLine[];
    frame?: BoundingFrame;
    boundingBox?: BoundingBox;
    recognizedLanguages: string[];
    cornerPoints?: Point[];
};
type Text = {
    text: string;
    blocks: TextBlock[];
};
export type OCRFrame = {
    result: Text;
};
export declare function scanOCR(frame: Frame): OCRFrame;
export {};
