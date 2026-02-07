import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "PortfolioPilot",
  description: "Твои достижения в одном месте",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* 🎨 НОВЫЙ НАВБАР */}
        <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Логотип */}
              <a href="/" className="group">
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300">
                  Portfolio<span className="text-indigo-600">Pilot</span>
                </h1>
              </a>

              {/* Навигация + Кнопки */}
              <div className="flex items-center gap-8">
                {/* Ссылки */}
                <div className="hidden md:flex items-center gap-8">
                  <a 
                    href="/dashboard" 
                    className="text-lg font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all duration-200"
                  >
                    Дашборд
                  </a>
                  <a 
                    href="/profile" 
                    className="text-lg font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all duration-200"
                  >
                    Профиль
                  </a>
                </div>

                {/* Кнопки авторизации */}
                <div className="flex items-center gap-3">
                  <a 
                    href="/login" 
                    className="hidden md:block text-lg font-semibold text-slate-700 hover:text-indigo-600 px-6 py-3 rounded-2xl hover:bg-slate-100 transition-all duration-200"
                  >
                    Войти
                  </a>
                  <a 
                    href="/register" 
                    className="text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300"
                  >
                    Регистрация
                  </a>
                </div>

                {/* Мобильное меню */}
                <div className="md:hidden">
                  <button className="p-2 rounded-xl hover:bg-slate-100">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Контент */}
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/30">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-20">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
