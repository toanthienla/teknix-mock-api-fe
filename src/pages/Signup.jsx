import logoDark from "@/assets/dark/logo.svg";
import logoLight from "@/assets/light/logo.svg";
import signupImageLight from "@/assets/light/signupImage.svg";
import signupImageDark from "@/assets/dark/signupImage.svg";
import tiktokIcon from "@/assets/light/tiktok.svg";
import fbIcon from "@/assets/light/facebook.svg";
import linkedinIcon from "@/assets/light/linkedin.svg";
import { SignupForm } from "@/components/SignupForm.jsx";
import "@/styles/pages/auth.css";
import {useTheme} from "@/services/useTheme.js";

export default function SignupPage() {
  const { isDark, toggleTheme } = useTheme();

  // Chọn ảnh theo theme
  const logo = isDark ? logoDark : logoLight;
  const signupImage = isDark ? signupImageDark : signupImageLight;

  return (
    <div className="auth-page min-h-screen w-full flex items-center justify-center px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 transition-colors duration-300">
      {/* Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-8 z-10 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold shadow-md transition-all duration-200"
      >
        {isDark ? "☀ Light" : "🌙 Dark"}
      </button>

      <div className="w-full rounded-2xl flex items-center justify-center auth-page">
        {/* Bố cục chính chia 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full auth-card rounded-2xl overflow-hidden">

          {/* Cột trái: Phần signup */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 relative">
            <div className="w-full max-w-sm">
              <SignupForm />
            </div>

            {/* Footer */}
            <div className="absolute left-4 sm:left-6 bottom-3 sm:bottom-4 text-xs text-center sm:text-left">
              © Teknix Corp. All rights reserved.
            </div>

            <div className="absolute right-4 sm:right-6 bottom-3 sm:bottom-4 flex items-center gap-2 sm:gap-3 text-xs">
              <img src={tiktokIcon} alt="tiktok" className="w-3 h-3 sm:w-4 sm:h-4 dark:invert" />
              <img src={fbIcon} alt="facebook" className="w-3 h-3 sm:w-4 sm:h-4 dark:invert" />
              <img src={linkedinIcon} alt="linkedin" className="w-3 h-3 sm:w-4 sm:h-4 dark:invert" />
              <a className="hover:underline font-semibold auth-link" href="">
                About
              </a>
              <span>·</span>
              <a className="hover:underline font-semibold auth-link" href="">
                Support
              </a>
            </div>
          </div>

          {/* Cột phải: Hình ảnh và mô tả */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:block">
            {/* Logo trên cùng */}
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <img
                src={logo}
                alt="MockAPI logo"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">MockHub</h1>
            </div>

            {/* Ảnh minh họa */}
            <div className="flex justify-center items-center mt-6 sm:mt-8">
              <img
                src={signupImage}
                alt="Astronaut"
                className="w-3/4 sm:w-full max-w-sm md:max-w-md rounded-xl object-contain hidden sm:block"
              />
            </div>

            {/* Mô tả ngắn */}
            <div className="mt-4 sm:mt-6 text-center lg:text-left">
              <h2 className="text-base sm:text-lg font-semibold">
                The easiest way to mock REST APIs
              </h2>
              <p className="opacity-70 text-sm font-semibold mt-2">
                Explore the universe of APIs, build your own world, mock anything you imagine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
