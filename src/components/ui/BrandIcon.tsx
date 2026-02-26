import Image from "next/image";

interface BrandIconProps {
  size?: number;
}

export function BrandIcon({ size = 40 }: BrandIconProps) {
  return (
    <Image
      src="/favicon.ico"
      alt="Coragem icon"
      width={size}
      height={size}
      style={{
        objectFit: "contain",
        borderRadius: "8px",
        display: "block",
      }}
    />
  );
}