import { BellIcon, Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="p-6 border-b-2">
      <div className="flex justify-between items center w-full">
        {/* Esquerda */}
        <div>
          <Link href="/home">
            <Image src="/logo.png" alt="Parô" width={29} height={36} />
          </Link>
        </div>
        {/* Direita */}
        <div className="flex items-center gap-6 text-primary">
          <Button variant="ghost" className="text-2xl">
            <BellIcon className="size-6" />
          </Button>
          <Button variant="ghost">
            <Menu className="size-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
