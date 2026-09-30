import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
const EVENT_PAYMENT_PREFIX = "event-registration:";

function getMidtransSnapUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

function getMidtransSnapJsUrl() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(values) {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}

function clean(value, max = 160) {
  return String(value || "").trim().slice(0, max);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function paymentPayload(order, token, clientKey) {
  const match = String(order.checkout_idempotency_key || "").match(/^event-registration:([0-9a-f-]{36}):([0-9a-f-]{36})$/i);
  return {
    token,
    orderId: order.order_number,
    clientKey,
    snapJsUrl: getMidtransSnapJsUrl(),
    registrationId: match?.[1] || null,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const eventSlug = clean(body?.eventSlug, 80).toLowerCase();
    const fullName = clean(body?.fullName, 120);
    const phone = clean(body?.phone, 30);
    const emergencyContactName = clean(body?.emergencyContactName, 120);
    const emergencyContactPhone = clean(body?.emergencyContactPhone, 30);
    const notes = clean(body?.notes, 500);
    const attemptKey = clean(body?.paymentAttemptKey, 36).toLowerCase();

    if (!eventSlug) return NextResponse.json({ error: "Event tidak tersedia." }, { status: 400 });
    if (fullName.length < 2) return NextResponse.json({ error: "Nama lengkap minimal 2 karakter." }, { status: 400 });
    if (phone.length < 8) return NextResponse.json({ error: "Nomor HP peserta minimal 8 karakter." }, { status: 400 });
    if (emergencyContactName.length < 2) return NextResponse.json({ error: "Nama kontak darurat minimal 2 karakter." }, { status: 400 });
    if (emergencyContactPhone.length < 8) return NextResponse.json({ error: "Nomor HP kontak darurat minimal 8 karakter." }, { status: 400 });

    const supabase = await getSupabase();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk mendaftar." }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) return NextResponse.json({ error: "Konfigurasi server belum lengkap." }, { status: 500 });
    const admin = createSupabaseAdmin(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: event, error: eventError } = await admin
      .from("events")
      .select("id,slug,title,status,registration_enabled,published,quota,price")
      .eq("slug", eventSlug)
      .maybeSingle();
    if (eventError) return NextResponse.json({ error: "Event tidak dapat diverifikasi." }, { status: 500 });
    if (!event || !event.published) return NextResponse.json({ error: "Event tidak tersedia." }, { status: 404 });
    if (!event.registration_enabled || ["DITUTUP", "SELESAI"].includes(event.status)) {
      return NextResponse.json({ error: "Pendaftaran event belum dibuka." }, { status: 400 });
    }

    const eventPrice = event.price == null ? 0 : Number(event.price);
    if (!Number.isSafeInteger(eventPrice) || eventPrice < 0) {
      return NextResponse.json({ error: "Harga event belum valid. Silakan hubungi Oxygen Gear." }, { status: 409 });
    }
    if (eventPrice > 0 && !isUuid(attemptKey)) {
      return NextResponse.json({ error: "Kunci percobaan pembayaran tidak valid. Silakan kirim ulang pendaftaran." }, { status: 400 });
    }

    const user = authData.user;
    const { data: existing, error: existingError } = await admin
      .from("event_registrations")
      .select("id,event_slug,user_id,status,created_at")
      .eq("event_slug", eventSlug)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingError) return NextResponse.json({ error: "Pendaftaran tidak dapat diverifikasi." }, { status: 500 });
    let registration = existing;
    if (existing?.status === "cancelled") {
      const { data: latestPayment, error: latestPaymentError } = await admin
        .from("orders")
        .select("payment_status")
        .eq("user_id", user.id)
        .like("checkout_idempotency_key", `${EVENT_PAYMENT_PREFIX}${existing.id}:%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latestPaymentError) return NextResponse.json({ error: "Status pembayaran sebelumnya gagal diverifikasi." }, { status: 500 });
      if (eventPrice <= 0 || !["failed", "expired", "cancelled"].includes(latestPayment?.payment_status)) {
        return NextResponse.json({ error: "Pendaftaran sebelumnya dibatalkan. Hubungi Oxygen Gear untuk mendaftar kembali." }, { status: 409 });
      }
      if (!process.env.MIDTRANS_SERVER_KEY || !(process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)) {
        return NextResponse.json({ error: "Konfigurasi pembayaran Midtrans belum lengkap." }, { status: 500 });
      }
      let resumedStatus = "pending";
      if (event.quota) {
        const { count, error } = await admin
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_slug", eventSlug)
          .in("status", ["pending", "confirmed"]);
        if (error) return NextResponse.json({ error: "Kuota event tidak dapat diverifikasi." }, { status: 500 });
        if ((count || 0) >= event.quota) resumedStatus = "waitlist";
      }
      const { data: resumed, error: resumeError } = await admin
        .from("event_registrations")
        .update({
          full_name: fullName,
          email: user.email || "",
          phone,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone,
          notes: notes || null,
          status: resumedStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .eq("user_id", user.id)
        .eq("status", "cancelled")
        .select("id,event_slug,user_id,status,created_at")
        .maybeSingle();
      if (resumeError || !resumed) return NextResponse.json({ error: "Pendaftaran tidak dapat dilanjutkan. Silakan coba lagi." }, { status: 409 });
      registration = resumed;
    }
    if (registration?.status === "waitlist") {
      return NextResponse.json({ registration, message: "Kuota penuh. Pendaftaran kamu sudah masuk waitlist." });
    }
    if (registration?.status === "confirmed") {
      return NextResponse.json({ registration, message: "Pendaftaran kamu sudah dikonfirmasi." });
    }

    if (!registration) {
      let registrationStatus = "pending";
      if (event.quota) {
        const { count, error } = await admin
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_slug", eventSlug)
          .in("status", ["pending", "confirmed"]);
        if (error) return NextResponse.json({ error: "Kuota event tidak dapat diverifikasi." }, { status: 500 });
        if ((count || 0) >= event.quota) registrationStatus = "waitlist";
      }

      if (registrationStatus === "pending" && eventPrice > 0 && (!process.env.MIDTRANS_SERVER_KEY || !(process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY))) {
        return NextResponse.json({ error: "Konfigurasi pembayaran Midtrans belum lengkap." }, { status: 500 });
      }

      const { data: created, error: insertError } = await admin
        .from("event_registrations")
        .insert({
          event_slug: eventSlug,
          user_id: user.id,
          full_name: fullName,
          email: user.email || "",
          phone,
          emergency_contact_name: emergencyContactName,
          emergency_contact_phone: emergencyContactPhone,
          notes: notes || null,
          status: registrationStatus,
        })
        .select("id,event_slug,user_id,status,created_at")
        .single();
      if (insertError) {
        if (insertError.code === "23505") {
          const { data: race } = await admin
            .from("event_registrations")
            .select("id,event_slug,user_id,status,created_at")
            .eq("event_slug", eventSlug)
            .eq("user_id", user.id)
            .maybeSingle();
          if (race) registration = race;
        } else {
          console.error("Gagal menyimpan pendaftaran event:", insertError);
          return NextResponse.json({ error: "Pendaftaran gagal disimpan. Silakan coba lagi." }, { status: 500 });
        }
      } else {
        registration = created;
      }
      if (!registration) return NextResponse.json({ error: "Pendaftaran gagal disimpan. Silakan coba lagi." }, { status: 500 });
    }

    if (registration.status === "cancelled") {
      return NextResponse.json({ error: "Pendaftaran sebelumnya dibatalkan. Hubungi Oxygen Gear untuk mendaftar kembali." }, { status: 409 });
    }
    if (registration.status === "waitlist") {
      return NextResponse.json({ registration, message: "Kuota penuh. Pendaftaran kamu masuk waitlist." });
    }
    if (registration.status === "confirmed") {
      return NextResponse.json({ registration, message: "Pendaftaran kamu sudah dikonfirmasi." });
    }

    if (eventPrice <= 0) {
      return NextResponse.json({
        registration,
        message: "Pendaftaran diterima. Tim Oxygen Gear akan menghubungi kamu untuk detail event.",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!serverKey || !clientKey) {
      return NextResponse.json({ error: "Konfigurasi pembayaran Midtrans belum lengkap." }, { status: 500 });
    }
    const paymentKey = `${EVENT_PAYMENT_PREFIX}${registration.id}:${attemptKey}`;
    const orderSelect = "id,order_number,user_id,status,total_amount,payment_status,payment_type,paid_at,midtrans_transaction_id,midtrans_snap_token,checkout_idempotency_key,created_at";
    const { data: latestOrder, error: latestError } = await admin
      .from("orders")
      .select(orderSelect)
      .eq("user_id", user.id)
      .like("checkout_idempotency_key", `${EVENT_PAYMENT_PREFIX}${registration.id}:%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestError) return NextResponse.json({ error: "Pembayaran event tidak dapat diverifikasi." }, { status: 500 });

    if (latestOrder && (latestOrder.status === "paid" || latestOrder.payment_status === "paid")) {
      const { data: confirmed } = await admin
        .from("event_registrations")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", registration.id)
        .eq("user_id", user.id)
        .eq("status", "pending")
        .select("id,event_slug,user_id,status,created_at")
        .maybeSingle();
      return NextResponse.json({
        registration: confirmed || { ...registration, status: "confirmed" },
        message: "Pembayaran event sudah diterima dan pendaftaran dikonfirmasi.",
      });
    }

    const paymentPending = latestOrder && ["pending", "authorized"].includes(latestOrder.payment_status || "");
    if (paymentPending && Number(latestOrder.total_amount) !== eventPrice) {
      return NextResponse.json({ error: "Harga event berubah sementara transaksi pembayaran masih terbuka. Hubungi Oxygen Gear sebelum mencoba lagi." }, { status: 409 });
    }
    if (paymentPending && latestOrder.midtrans_snap_token) {
      return NextResponse.json({
        registration,
        payment: paymentPayload(latestOrder, latestOrder.midtrans_snap_token, clientKey),
        message: "Pendaftaran tersimpan. Selesaikan pembayaran untuk mengamankan tempatmu.",
        reused: true,
      });
    }

    let order = latestOrder && paymentPending ? latestOrder : null;
    if (!order) {
      const { data: existingAttempt, error: attemptError } = await admin
        .from("orders")
        .select(orderSelect)
        .eq("user_id", user.id)
        .eq("checkout_idempotency_key", paymentKey)
        .maybeSingle();
      if (attemptError) return NextResponse.json({ error: "Pembayaran event tidak dapat diverifikasi." }, { status: 500 });
      order = existingAttempt;
    }

    if (!order) {
      const orderNumber = `EVT-${registration.id.replaceAll("-", "").slice(0, 12)}-${attemptKey.replaceAll("-", "")}`;
      const { data: createdOrder, error: orderError } = await admin
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: "pending_payment",
          total_amount: eventPrice,
          payment_status: "pending",
          checkout_idempotency_key: paymentKey,
        })
        .select(orderSelect)
        .single();
      if (orderError) {
        const { data: race } = await admin
          .from("orders")
          .select(orderSelect)
          .eq("order_number", orderNumber)
          .eq("user_id", user.id)
          .maybeSingle();
        if (!race) {
          console.error("Gagal menyiapkan pembayaran event:", orderError);
          return NextResponse.json({ error: "Pembayaran event gagal disiapkan. Silakan coba lagi." }, { status: 500 });
        }
        order = race;
      } else {
        order = createdOrder;
      }
    }

    if (Number(order.total_amount) !== eventPrice) {
      return NextResponse.json({ error: "Harga event berubah. Muat ulang halaman sebelum membayar." }, { status: 409 });
    }

    const { data: savedItems, error: savedItemsError } = await admin
      .from("order_items")
      .select("id")
      .eq("order_id", order.id)
      .limit(1);
    if (savedItemsError) return NextResponse.json({ error: "Detail pembayaran event tidak dapat diverifikasi." }, { status: 500 });
    if (!savedItems?.length) {
      const { error } = await admin.from("order_items").insert({
        order_id: order.id,
        product_id: null,
        product_name: `Pendaftaran event: ${event.title}`.slice(0, 180),
        quantity: 1,
        unit_price: eventPrice,
      });
      if (error) {
        console.error("Gagal menyimpan detail pembayaran event:", error);
        return NextResponse.json({ error: "Detail pembayaran event gagal disimpan." }, { status: 500 });
      }
    }

    const orderAttempt = String(order.checkout_idempotency_key || "").split(":").at(-1) || attemptKey;
    const midtransRes = await fetch(getMidtransSnapUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Basic " + Buffer.from(`${serverKey}:`).toString("base64"),
        "Idempotency-Key": orderAttempt,
      },
      body: JSON.stringify({
        transaction_details: { order_id: order.order_number, gross_amount: eventPrice },
        customer_details: { first_name: fullName, email: user.email || "", phone },
        item_details: [{
          id: `event-${event.id}`.slice(0, 50),
          price: eventPrice,
          quantity: 1,
          name: `Event: ${event.title}`.slice(0, 50),
        }],
      }),
    });

    const midtrans = await midtransRes.json().catch(() => ({}));
    if (!midtransRes.ok) {
      console.error("Midtrans event checkout error:", midtrans.error_messages || midtrans);
      return NextResponse.json({ error: "Gagal membuat transaksi Midtrans. Pendaftaran kamu tetap tersimpan; silakan coba lagi." }, { status: 502 });
    }
    if (!midtrans.token) return NextResponse.json({ error: "Midtrans tidak mengembalikan token pembayaran." }, { status: 502 });

    const { error: tokenError } = await admin
      .from("orders")
      .update({ midtrans_snap_token: midtrans.token, payment_status: "pending", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (tokenError) {
      console.error("Gagal menyimpan Snap token event:", tokenError);
      return NextResponse.json({ error: "Transaksi dibuat tetapi token belum tersimpan. Silakan coba lagi." }, { status: 500 });
    }

    return NextResponse.json({
      registration,
      payment: paymentPayload(order, midtrans.token, clientKey),
      message: "Pendaftaran tersimpan. Selesaikan pembayaran untuk mengamankan tempatmu.",
    });
  } catch (error) {
    console.error("Event registration error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat mendaftarkan peserta." }, { status: 500 });
  }
}
