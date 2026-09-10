import { redirect } from "next/navigation";

export default async function PesananDetailPage({ params }) {
  const { order } = await params;
  redirect(`/status-pengiriman?order=${encodeURIComponent(order || "")}`);
}
