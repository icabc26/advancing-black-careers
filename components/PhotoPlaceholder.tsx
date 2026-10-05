import Image from "next/image";

type Props = {
  /** Caption shown when no real image is provided (e.g. "photo — committee"). */
  label?: string;
  /** Optional real image src in /public. When set, the image replaces the glow. */
  src?: string;
  alt?: string;
  className?: string;
  /**
   * Intrinsic size of the image. When both are set, the image sizes itself
   * (full width, height from its own aspect ratio), so the box never depends
   * on the parent having a height. Without them the image fills the box, and
   * `className` must give the box a height (e.g. `aspect-square`).
   */
  width?: number;
  height?: number;
  /** Responsive `sizes` hint so Next serves a small enough file. */
  sizes?: string;
  /** Inline style for the frame, e.g. a hard size cap that never depends on CSS loading. */
  style?: React.CSSProperties;
};

/**
 * Gold-glow "photo" slot from the design. Renders a real image when `src` is
 * provided, otherwise a luxe placeholder with a mono caption marking where the
 * society's own photography goes.
 */
export default function PhotoPlaceholder({
  label,
  src,
  alt = "",
  className = "",
  width,
  height,
  sizes = "100vw",
  style,
}: Props) {
  if (src) {
    const intrinsic = width !== undefined && height !== undefined;
    return (
      <div
        className={`relative overflow-hidden rounded-[3px] border border-hairline ${className}`}
        style={style}
      >
        {intrinsic ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            className="block h-auto w-full"
          />
        ) : (
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
        )}
      </div>
    );
  }
  return (
    <div
      className={`glow-fill flex items-end rounded-[3px] border border-hairline p-5 ${className}`}
    >
      {label && (
        <span className="font-mono text-[10px] tracking-wide text-mono-label">[ {label} ]</span>
      )}
    </div>
  );
}