import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] dark:bg-[#1A1816] text-[#2D2622] dark:text-[#F5F2EB] p-6 text-center">
      <h2 className="font-serif text-3xl font-bold mb-3 text-[#C25E38] dark:text-[#E06D43]">404 — Page Not Found</h2>
      <p className="text-sm text-[#8C7B70] dark:text-[#A89F91] mb-6 max-w-md">
        The wisdom seeker has requested a path that does not exist in this domain.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-[#C25E38] dark:bg-[#E06D43] text-white font-semibold text-xs shadow-md hover:scale-105 transition"
      >
        Return to Home
      </Link>
    </div>
  );
}
