import Image from "next/image";
import TreeLogo from "@/assets/tree.svg";
import Link from "next/link";
const Logo = () => {
  return (
    <Link href="#top" className="flex items-center">
      <Image src={TreeLogo} alt="logo" />
      <span className="font-bold text-sm text-[#1E3D34] uppercase">
        SMADAPVEST
      </span>
    </Link>
  );
};

export default Logo;
