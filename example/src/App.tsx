/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  LayoutChangeEvent,
  TouchableOpacity,
  Alert,
  Clipboard,
  StyleSheet,
} from 'react-native';
import {
  useFrameProcessor,
  Camera,
  useCameraDevice,
  useCameraFormat,
} from 'react-native-vision-camera';

import {useSharedValue, Worklets} from 'react-native-worklets-core';

import {OCRFrame, scanOCR} from '@ismaelmoreiraa/vision-camera-ocr';
import {Region, RegionOverlay} from './components/InnerRegionOverlay';

export default function App() {
  const [dimensions, setDimensions] = useState({width: 1, height: 1});

  const frameWidthAndHeightRef = useSharedValue({height: 1, width: 1});

  /**
   * Camera
   */
  const [hasPermission, setHasPermission] = React.useState(false);
  const [targetFps] = useState(60);
  const cropSizeRef = useSharedValue<Region | undefined>(undefined);
  const [ocr, setOcr] = useState<OCRFrame>();
  const [finalSymbols, setFinalSymbols] = useState([]);
  const setOcrJS = Worklets.createRunInJsFn(setOcr);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {videoResolution: 'max'},
    {photoResolution: 'max'},
  ]);

  const fps = Math.min(format?.maxFps ?? 1, targetFps);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      frameWidthAndHeightRef.value = {
        height: frame.height,
        width: frame.width,
      };

      const data = scanOCR(frame);
      console.log(
        '🚀 ~ file: App.tsx:68 ~ frameProcessor ~ data:',
        JSON.stringify(
          data.result?.blocks?.map(_ =>
            _.lines.map(_ =>
              _.elements.map(_ =>
                _.symbols?.map(_ => ({
                  text: _.text,
                  height: _.frame!.height,
                })),
              ),
            ),
          ),
          null,
          2,
        ),
      );

      if (!data.result.text) {
        return;
      }

      setOcrJS({...data});
    },
    [cropSizeRef],
  );

  useEffect(() => {
    if (!ocr?.result?.text || !cropSizeRef.value?.layout?.height) {
      return;
    }

    let symbols: Symbol[] = [];

    ocr.result?.blocks?.forEach(_ =>
      _.lines.forEach(_ =>
        _.elements.forEach(_ =>
          _.symbols?.forEach(_ => {
            symbols.push(_);
          }),
        ),
      ),
    );

    const h = cropSizeRef.value?.layout.height;

    symbols = symbols.filter(_ => {
      const calc = (_.frame!.height * 100) / h;
      console.log('🚀 ~ ~ calc:', _.text, calc, _.frame?.height, h);
      return calc > 40;
    });
    setFinalSymbols(symbols);
  }, [cropSizeRef, ocr]);

  // useEffect(() => {
  //   if (!ocr?.result?.text) {
  //     return;
  //   }
  //   fetch('https://electric-assured-redbird.ngrok-free.app/api/log', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       json: ocr.result,
  //       type: 'text',
  //     }),
  //   })
  //     .then(res => {
  //       console.log('🧩 Success', res);
  //     })
  //     .catch(err => {
  //       console.error('🚨 Error', err);
  //     });
  // }, [ocr]);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const renderOverlay = () => {
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          // left: block.frame.x / convertedHeight,
          // top: block.frame.y / convertedWidth,
          backgroundColor: 'white',
          padding: 8,
          borderRadius: 6,
          zIndex: 100,
        }}>
        <Text
          style={{
            fontSize: 25,
            justifyContent: 'center',
            textAlign: 'center',
            color: 'black',
          }}>
          {finalSymbols
            .map(_ => _.text)
            .join('')
            .replace(/[^a-zA-Z0-9]/g, '')}
        </Text>
      </TouchableOpacity>
    );
  };

  return device !== undefined && hasPermission ? (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <View
        onLayout={(event: LayoutChangeEvent) => {
          setDimensions({
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
          });
        }}
        style={{
          backgroundColor: 'black',
          aspectRatio:
            frameWidthAndHeightRef.value.width /
            frameWidthAndHeightRef.value.height,
          width: '100%',
        }}>
        <Camera
          style={StyleSheet.absoluteFill}
          frameProcessor={frameProcessor}
          device={device}
          fps={fps}
          pixelFormat="yuv"
          isActive={true}
          photo={true}
          orientation="portrait"
          format={format}
        />
        {renderOverlay()}
        <RegionOverlay
          onRegion={e => {
            console.log(JSON.stringify(e, null, 2));
            cropSizeRef.value = e;
          }}
        />
      </View>
    </View>
  ) : (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>No available cameras</Text>
    </View>
  );
}
