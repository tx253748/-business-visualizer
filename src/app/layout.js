import './globals.css';

export const metadata = {
  title: '事業可視化ツール',
  description: '事業の現状を可視化し、診断・改善提案を行うツール',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
