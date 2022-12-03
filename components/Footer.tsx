import Link from "next/link";

export default function Footer() {
  const ALEX_HANDLE = "alerex_eth";
  const ALEX_LINK = `https://twitter.com/${ALEX_HANDLE}`;
  const D_D_LINK = "https://agency.developerdao.com/";
  return (
    <footer className="flex justify-center md:justify-between p-5 font-base text-sm opacity-70">
      <div className="flex text-white text-sm">
        <Link href="/policy" className="mr-3">
          <p>Privacy policy</p>
        </Link>
        <Link href="/terms" className="mr-3">
          <p>Terms & conditions</p>
        </Link>
        <Link href="/about" className="mr-3">
          <p>About</p>
        </Link>
      </div>
      <div className="hidden md:block">
        <p className="text-white">
          Built with 💙 and ☕ by{" "}
          <a
            className="font-semibold hover:underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
            href={ALEX_LINK}
          >
            @alerex {"  "}
          </a>
          &{" "}
          <a
            className="font-semibold hover:underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
            href={D_D_LINK}
          >
            D_D Agency
          </a>
        </p>
      </div>
    </footer>
  );
}
