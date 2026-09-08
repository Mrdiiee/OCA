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
