export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <title>FindNews</title>
        <link rel="icon" href="/vercel.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}