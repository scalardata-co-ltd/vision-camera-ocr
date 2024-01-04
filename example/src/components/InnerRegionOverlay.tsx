import React, {ComponentProps, FC} from 'react';
import type {LayoutRectangle} from 'react-native';
import BaseBarcodeMask, {LayoutChangeEvent} from 'react-native-barcode-mask';

type BaseProps = Partial<ComponentProps<typeof BaseBarcodeMask>>;

export type Region = {
  rect: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  layout: LayoutRectangle;
};

type Props = {
  onRegion?: (_: Region) => void;
} & BaseProps;

const InnerRegionOverlay: FC<Props> = ({onRegion, ...props}) => {
  const sizeProp = {
    width: props.width ? `${props.width}%` : '80%',
    height: props.height ? `${props.height}%` : '20%',
  };

  const onLayout = (e: LayoutChangeEvent) => {
    if (!onRegion) {
      return;
    }

    const {layout} = e.nativeEvent;

    const top = layout.y;
    const bottom = layout.y + layout.height;
    const left = layout.x;
    const right = layout.x + layout.width;

    onRegion({
      layout,
      rect: {
        bottom,
        left,
        right,
        top,
      },
    });
  };

  return (
    <BaseBarcodeMask
      edgeBorderWidth={2}
      outerMaskOpacity={1}
      showAnimatedLine={false}
      edgeColor={'#62B1F6'}
      backgroundColor={'#f900006e'}
      {...props}
      onLayoutMeasured={onLayout}
      width={sizeProp.width}
      height={sizeProp.height}
    />
  );
};

export const RegionOverlay = React.memo(InnerRegionOverlay, (prev, next) => {
  const sameWidth = prev.width === next.width;
  const sameHeight = prev.height === next.height;

  return sameWidth && sameHeight;
});
