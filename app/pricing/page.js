import { headers } from "next/headers";

export default function PricingPage() {
  const country = headers().get("x-vercel-ip-country");

  const isNigeria = country === "NG";

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Upgrade to Pro</h1>

      {isNigeria ? (
        <p className="text-2xl mt-4">₦5,000</p>
      ) : (
        <p className="text-2xl mt-4">$9</p>
      )}

      <a
        href="/upgrade"
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded"
      >
        Upgrade Now
      </a>
    </div>
  );
}
