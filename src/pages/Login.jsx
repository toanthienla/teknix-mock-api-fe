import {useEffect, useState} from "react";
import loginImageLight from "@/assets/light/loginImage.svg";
import loginImageDark from "@/assets/dark/loginImage.svg";
import logoLight from "@/assets/light/logo.svg";
import logoDark from "@/assets/dark/logo.svg";
import tiktokIcon from "@/assets/light/tiktok.svg";
import fbIcon from "@/assets/light/facebook.svg";
import linkedinIcon from "@/assets/light/linkedin.svg";
import { LoginForm } from "@/components/LoginForm.jsx";
import "@/styles/login.css";

export default function LoginPage() {
  const [isDark, setIsDark] = useState(false);

  // Khi load lại trang, đọc theme từ localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", newTheme);
  };

  // Chọn ảnh theo theme
  const logo = isDark ? logoDark : logoLight;
  const loginImage = isDark ? loginImageDark : loginImageLight;

  return (
    <div className="login-page min-h-screen w-full flex items-center justify-center py-2 sm:p-3 md:p-4 transition-colors duration-300">
      {/* Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-8 z-10 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold shadow-md transition-all duration-200"
      >
        {isDark ? "☀ Light" : "🌙 Dark"}
      </button>

      {/* Viền ngoài */}
      <div className="w-full flex items-center justify-center login-page rounded-2xl">
        {/* Bố cục chính */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full login-card rounded-2xl overflow-hidden">

          {/* Cột trái */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 md:p-10">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <img src={logo} alt="MockAPI logo" className="w-8 h-8 sm:w-10 sm:h-10 transition-opacity duration-300" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">MockHub</h1>
            </div>

            <div className="flex justify-center items-center mt-6 sm:mt-8">
              <img
                src={loginImage}
                alt="Login Image"
                className="w-full sm:w-full md:max-w-md rounded-xl object-contain hidden sm:block transition-opacity duration-300"
              />
            </div>

            <div className="mt-4 sm:mt-6 text-center lg:text-left">
              <h2 className="text-base sm:text-lg font-semibold">
                The easiest way to mock REST APIs
              </h2>
              <p className="opacity-70 text-sm font-semibold mt-2">
                Explore the universe of APIs, build your own world, mock anything you imagine.
              </p>
            </div>
          </div>

          {/* Cột phải */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 relative">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>

            <div className="absolute left-4 sm:left-6 bottom-3 sm:bottom-4 text-xs font-medium">
              © Teknix Corp. All rights reserved.
            </div>

            <div className="absolute right-4 sm:right-6 bottom-3 sm:bottom-4 flex items-center gap-2 sm:gap-3 text-xs opacity-80">
              <img src={tiktokIcon} alt="tiktok" className="w-3 h-3 sm:w-4 sm:h-4 dark:invert" />
              <img src={fbIcon} alt="facebook" className="w-3 h-3 sm:w-4 sm:h-4 dark:invert" />
              <img src={linkedinIcon} alt="linkedin" className="w-3 h-3 sm:w-4 sm:h-4 dark:invert" />
              <a className="hover:underline font-semibold" href="">About</a>
              <span>·</span>
              <a className="hover:underline font-semibold" href="">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
