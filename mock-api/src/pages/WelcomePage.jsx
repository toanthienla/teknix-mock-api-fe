import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    // nền ngoài (giữ padding/viền hồng nhạt như trước)
    <div className="h-screen w-full bg-pink-50 p-6 flex items-center justify-center">
      {/* Wrapper có viền "ngoài" theo yêu cầu:
          - borderWidth: '10px 20px' => top/bottom 10px, left/right 20px
          - borderColor: slate-50 (#f8fafc)
          - borderStyle: solid
      */}
      <div
        style={{
          borderStyle: "solid",
          borderWidth: "10px 20px", // top/bottom 10px, left/right 20px
          borderColor: "#f8fafc",
          borderRadius: "18px", // nhẹ bo góc cho viền ngoài
        }}
        className="w-full max-w-6xl"
      >
        {/* card chính — trắng, bo góc, có border hồng nhẹ và shadow */}
        <div className="relative bg-white rounded-2xl border border-pink-100 shadow-lg p-12">
          {/* nội dung giữa */}
          <div className="flex flex-col items-center text-center">
            <h1 className="font-extrabold leading-tight text-[#0b1220] text-5xl sm:text-6xl md:text-7xl">
              {/* Dòng 1: Hello! + circle icon */}
              <div className="flex items-center justify-center gap-4 mb-1">
                <span className="block">
                  Hello<span className="text-yellow-300">!</span>
                </span>

                {/* vòng tím với icon người */}
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-200">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="8" r="3.2" fill="#2b2350" />
                    <path d="M6 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#2b2350" />
                  </svg>
                </span>
              </div>

              {/* Dòng 2: to + yellow square logo + MockAPI (màu tím) */}
              <div className="flex items-center justify-center gap-4 mb-1">
                <span className="block text-3xl sm:text-4xl md:text-5xl">to</span>

                {/* ô vuông vàng logo */}
                <span className="inline-flex items-center justify-center w-16 h-16 bg-yellow-300 rounded-md shadow-sm">
                  <span className="font-black text-lg tracking-tighter text-[#1b1b1b]">
                    M.
                  </span>
                </span>

                <span className="block text-3xl sm:text-4xl md:text-5xl text-violet-300">
                  MockAPI
                </span>
              </div>

              {/* Dòng 3: Platform. */}
              <div className="mt-2">
                <span className="block text-4xl sm:text-5xl md:text-6xl">
                  Platform<span className="text-violet-300">.</span>
                </span>
              </div>
            </h1>

            {/* chú thích nhỏ */}
            <p className="text-gray-400 text-sm mt-6">Login to use</p>

            {/* nút login dạng pill màu vàng */}
            <Button
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center gap-3 rounded-full px-6 py-2 text-sm font-medium shadow-md bg-yellow-300 hover:bg-yellow-400 text-black"
            >
              <span>Login</span>
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* footer nhỏ: trái và phải */}
          <div className="absolute left-6 bottom-4 text-xs text-gray-500">
            © Teknik Corp. All rights reserved.
          </div>

          <div className="absolute right-6 bottom-4 flex items-center gap-3 text-xs text-gray-600">
            <a className="hover:underline" href="#about">
              About
            </a>
            <span>·</span>
            <a className="hover:underline" href="#support">
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
