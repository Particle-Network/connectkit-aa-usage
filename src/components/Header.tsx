import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Particle Connect 2.0",
  description:
    "Leverage Particle Connect 2.0 for social and native Web3 logins with Account Abstraction",
  icons: {
    icon: "/favicon.ico",
  },
};

const Header: React.FC = () => {
  const mainHeading = {
    text: "Welcome to",
    linkHref: "https://particle.network",
    linkImageSrc: "/dark.png",
    linkImageAlt: "Particle Logo",
    linkImageWidth: 240,
    linkImageHeight: 24,
  };

  const subHeading =
    "Leverage Particle Connect 2.0 for social and native Web3 logins with Account Abstraction";

  return (
    <>
      {/* Main Heading */}
      <h1 className="text-3xl md:text-4xl mt-4 font-bold mb-8 text-center flex flex-col md:flex-row items-center justify-center gap-4">
        {mainHeading.text}
        <a
          href={mainHeading.linkHref}
          className="text-purple-400 hover:text-purple-300 transition duration-300"
        >
          <Image
            src={mainHeading.linkImageSrc}
            alt={mainHeading.linkImageAlt}
            width={mainHeading.linkImageWidth}
            height={mainHeading.linkImageHeight}
            className="mx-auto md:mx-0"
          />
        </a>
      </h1>

      {/* Subheading */}
      <h2 className="text-lg md:text-xl font-bold mb-6 text-center px-4 md:px-0">
        {subHeading}
      </h2>
    </>
  );
};

export default Header;
