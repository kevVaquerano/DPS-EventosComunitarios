import { useWindowDimensions } from 'react-native';

// Hook centralizado para no repetir la lógica de breakpoints en cada pantalla
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Breakpoints alineados con los estándares de Tailwind (sm: 640, lg: 1024)
  const isMobile  = width < 640;
  const isTablet  = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  // A 1100px hay espacio real para 3 columnas sin que las cards queden aplastadas
  const columns = width >= 1100 ? 3 : width >= 640 ? 2 : 1;

  // Padding horizontal progresivo para que el contenido respire en pantallas grandes
  const hPad = width < 480 ? 16 : width < 768 ? 24 : 40;

  // Límite máximo para que el layout no se estire demasiado en monitores anchos
  const maxContent = Math.min(width, 1200);

  // Escala de fuentes: la diferencia entre móvil y escritorio es intencional,
  // ya que en web el usuario está más lejos de la pantalla
  const fs = {
    xs:  isMobile ? 11 : 12,
    sm:  isMobile ? 12 : 13,
    md:  isMobile ? 14 : 15,
    lg:  isMobile ? 17 : 19,
    xl:  isMobile ? 21 : 25,
    xxl: isMobile ? 26 : 32,
  };

  // Espaciado proporcional para mantener jerarquía visual en cualquier tamaño
  const sp = {
    xs: isMobile ? 4  : 6,
    sm: isMobile ? 8  : 12,
    md: isMobile ? 16 : 20,
    lg: isMobile ? 20 : 28,
    xl: isMobile ? 28 : 40,
  };

  return { width, height, isMobile, isTablet, isDesktop, columns, hPad, maxContent, fs, sp };
}
