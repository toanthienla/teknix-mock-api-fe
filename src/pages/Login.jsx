import loginImage from "@/assets/loginImage.svg";
import tiktokIcon from "@/assets/tiktok.svg";
import fbIcon from "@/assets/facebook.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import logo from "@/assets/logo.svg";
import { LoginForm } from "@/components/LoginForm.jsx";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-2 sm:p-3 md:p-4">
      {/* Viền ngoài */}
      <div
        style={{
          borderStyle: "solid",
          borderWidth: "10px 20px",
          borderColor: "#f8fafc",
          borderRadius: "18px",
        }}
        className="w-full max-w-7xl flex items-center justify-center bg-slate-50"
      >
        {/* Bố cục chính chia 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full bg-white rounded-2xl border border-slate-50 shadow-lg overflow-hidden">

          {/* Cột trái: Hình ảnh và mô tả */}
          <div className="relative flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-white lg:block">
            {/* Logo trên cùng */}
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <img src={logo} alt="MockAPI logo" className="w-10 h-10 sm:w-12 sm:h-12" />
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">MockAPI</h1>
            </div>

            {/* Ảnh minh họa */}
            <div className="flex justify-center items-center mt-6 sm:mt-8">
              <img
                src={loginImage}
                alt="Astronaut"
                className="w-3/4 sm:w-full max-w-sm md:max-w-md rounded-xl object-contain hidden sm:block"
              />
            </div>

            {/* Mô tả ngắn */}
            <div className="mt-4 sm:mt-6 text-center lg:text-left">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                The easiest way to mock REST APIs
              </h2>
              <p className="text-slate-400 text-sm font-semibold mt-2">
                Explore the universe of APIs, build your own world, mock anything you imagine.
              </p>
            </div>
          </div>

          {/* Cột phải: Phần login */}
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 md:p-10 relative bg-white">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>

            {/* Footer */}
            <div className="absolute left-4 sm:left-6 bottom-3 sm:bottom-4 text-xs text-gray-500 text-center sm:text-left">
              © Teknix Corp. All rights reserved.
            </div>

            <div className="absolute right-4 sm:right-6 bottom-3 sm:bottom-4 flex items-center gap-2 sm:gap-3 text-xs text-gray-600">
              <img src={tiktokIcon} alt="tiktok" className="w-3 h-3 sm:w-4 sm:h-4" />
              <img src={fbIcon} alt="facebook" className="w-3 h-3 sm:w-4 sm:h-4" />
              <img src={linkedinIcon} alt="linkedin" className="w-3 h-3 sm:w-4 sm:h-4" />
              <a className="hover:underline font-semibold" href="">
                About
              </a>
              <span>·</span>
              <a className="hover:underline font-semibold" href="">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
