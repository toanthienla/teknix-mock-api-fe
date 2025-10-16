import signupImage from "@/assets/signupImage.svg";
import tiktokIcon from "@/assets/tiktok.svg";
import fbIcon from "@/assets/facebook.svg";
import linkedinIcon from "@/assets/linkedin.svg";
import logo from "@/assets/logo.svg";
import {SignupForm} from "@/components/SignupForm.jsx";

export default function SignupPage() {
  return (
    <div className="h-screen w-full bg-pink-50 flex items-center justify-center">
      {/* Viền ngoài */}
      <div
        style={{
          borderStyle: "solid",
          borderWidth: "10px 20px",
          borderColor: "#f8fafc",
          borderRadius: "18px",
        }}
        className="h-full w-full flex items-center justify-center bg-slate-50"
      >
        {/* Bố cục chính chia 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full w-full bg-white rounded-2xl border border-pink-100 shadow-lg overflow-hidden">
          {/* Cột trái: Phần signup */}
          <div className="flex flex-col items-center justify-center p-10 relative">
            <div className="w-full max-w-sm">
              <SignupForm/>
            </div>

            {/* Footer */}
            <div className="absolute left-6 bottom-4 text-xs text-gray-500">
              © Teknix Corp. All rights reserved.
            </div>

            <div className="absolute right-6 bottom-4 flex items-center gap-3 text-xs text-gray-600">
              <img src={tiktokIcon} alt="tiktok" className="w-4 h-4" />
              <img src={fbIcon} alt="facebook" className="w-4 h-4" />
              <img src={linkedinIcon} alt="linkedin" className="w-4 h-4" />
              <a className="hover:underline font-semibold" href="">
                About
              </a>
              <span>·</span>
              <a className="hover:underline font-semibold" href="">
                Support
              </a>
            </div>
          </div>

          {/* Cột phải: Hình ảnh và mô tả */}
          <div className="relative flex flex-col justify-between p-10">
            {/* Logo trên cùng */}
            <div className="flex items-center ml-8 gap-2">
              <img src={logo} alt="MockAPI logo" className="w-12 h-12"/>
              <h1 className="text-5xl font-bold text-slate-900">MockAPI</h1>
            </div>

            {/* Ảnh minh họa */}
            <div className="flex justify-center items-center mt-8">
              <img
                src={signupImage}
                alt="Astronaut"
                className="w-full max-w-md rounded-xl object-contain"
              />
            </div>

            {/* Mô tả ngắn */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900">
                The easiest way to mock REST APIs
              </h2>
              <p className="text-slate-400 text-sm font-semibold mt-2">
                Explore the universe of APIs, build your own world, mock anything you imagine.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
