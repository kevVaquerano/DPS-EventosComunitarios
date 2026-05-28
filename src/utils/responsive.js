import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  const columns = width >= 1100 ? 3 : width >= 640 ? 2 : 1;

  const hPad = width < 480 ? 16 : width < 768 ? 24 : 40;

  const maxContent = Math.min(width, 1200);

  const fs = {
    xs:  isMobile ? 11 : 12,
    sm:  isMobile ? 12 : 13,
    md:  isMobile ? 14 : 15,
    lg:  isMobile ? 17 : 19,
    xl:  isMobile ? 21 : 25,
    xxl: isMobile ? 26 : 32,
  };

  const sp = {
    xs: isMobile ? 4  : 6,
    sm: isMobile ? 8  : 12,
    md: isMobile ? 16 : 20,
    lg: isMobile ? 20 : 28,
    xl: isMobile ? 28 : 40,
  };

  return { width, height, isMobile, isTablet, isDesktop, columns, hPad, maxContent, fs, sp };
}
