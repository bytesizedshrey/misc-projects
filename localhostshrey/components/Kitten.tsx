import Image from "next/image";

export default function Kitten() {
  return (
    <span className="kitten-wrap">
      <span className="kitten" role="img" aria-label="kitten" tabIndex={0}>
        <Image
          src="/assets/kitten.png"
          alt=""
          width={245}
          height={245}
          sizes="48px"
          quality={92}
        />
      </span>
      <span className="kitten-pop" aria-hidden="true">
        <Image
          src="/assets/kitten.png"
          alt=""
          width={245}
          height={245}
          sizes="200px"
          quality={92}
        />
      </span>
    </span>
  );
}
