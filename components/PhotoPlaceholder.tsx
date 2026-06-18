import Image from "next/image";

type Props = {
  /** Caption shown when no real image is provided (e.g. "photo — committee"). */
  label?: string;
  /** Optional real image src in /public. When set, the image replaces the glow. */
  src?: string;
  alt?: string;
  className?: string;
};

/**
 * Gold-glow "photo" slot from the design. Renders a real image when `src` is
 * provided, otherwise a luxe placeholder with a mono caption marking where the
 * society's own photography goes.
 */
export default function PhotoPlaceholder({ label, src, alt = "", className = "" }: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-[3px] border border-hairline ${className}`}>
        <Image src={src} alt={alt} fill className="object-cover" />
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
