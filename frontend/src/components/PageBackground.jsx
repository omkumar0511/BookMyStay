import { TRAVEL_IMAGES, getTravelThemeForPath } from '../data/travelThemes';

/**
 * Soft blurred travel background for any page shell.
 * Keep opacity low so text and cards stay readable.
 */
const PageBackground = ({
  themeKey,
  pathname = '/',
  image: imageProp,
  opacity = 0.28,
  blur = 12,
  children,
  className = '',
  style = {},
  fill = true,
}) => {
  const fromPath = getTravelThemeForPath(pathname);
  const image =
    imageProp ||
    (themeKey ? TRAVEL_IMAGES[themeKey] : null) ||
    fromPath.image;

  return (
    <div
      className={`page-with-travel-bg ${className}`.trim()}
      style={{
        position: 'relative',
        minHeight: fill ? '100%' : undefined,
        isolation: 'isolate',
        ...style,
      }}
    >
      <div
        className="page-travel-bg-layer"
        aria-hidden="true"
        style={{
          backgroundImage: `url("${image}")`,
          opacity,
          filter: `blur(${blur}px)`,
        }}
      />
      <div className="page-travel-bg-veil" aria-hidden="true" />
      <div className="page-travel-content">{children}</div>
    </div>
  );
};

export default PageBackground;
