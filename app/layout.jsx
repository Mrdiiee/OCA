export const metadata = {
  title: "Oxygen Gear Equipment",
  description:
    "Peralatan teknis dan jasa private trip untuk mereka yang pergi lebih jauh.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}

```jsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0 }}>
        {children}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
```
