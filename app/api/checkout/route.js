import { NextResponse } from "next/server";

// GANTI ke "https://app.midtrans.com/snap/v1/transactions" saat sudah pindah ke mode Production
const MIDTRANS_SNAP_URL = "https://app.sandbox.midtrans.com/snap/v1/transactions";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, address, items, total } = body;

    if (!items || !items.length || !total) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap." },
        { status: 400 }
      );
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json(
        { error: "MIDTRANS_SERVER_KEY belum diatur di environment variable." },
        { status: 500 }
      );
    }

    const orderId = `OXY-${Date.now()}`;
    const authHeader = "Basic " + Buffer.from(`${serverKey}:`).toString("base64");

    const midtransRes = await fetch(MIDTRANS_SNAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: total,
        },
        customer_details: {
          first_name: name || "Pelanggan",
          phone: phone || "",
          billing_address: { address: address || "" },
        },
        item_details: items.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.qty,
          name: item.name,
        })),
      }),
    });

    const data = await midtransRes.json();

    if (!midtransRes.ok) {
      const message =
        (Array.isArray(data.error_messages) && data.error_messages.join(", ")) ||
        "Gagal membuat transaksi Midtrans.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ token: data.token, orderId });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses pesanan." },
      { status: 500 }
    );
  }
}
