import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link href="/" className="flex h-full shrink-0 items-center">
      <img
        src="/white-cropped.png"
        alt="Cascadheure"
        className="block h-auto w-32 object-contain object-left md:w-48"
      />
    </Link>
  );
}
