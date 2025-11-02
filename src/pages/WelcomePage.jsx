import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import helloIcon from "@/assets/human_hello.svg";
import yellowLogo from "@/assets/yellow_logo.svg";
import tiktokIcon from "@/assets/tiktok.svg";
import fbIcon from "@/assets/facebook.svg";
import linkedinIcon from "@/assets/linkedin.svg";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    // nền ngoài (giữ padding/viền hồng nhạt như trước)
    <div className="h-screen w-full bg-pink-50 flex items-center justify-center">
      {/* Viền ngoài theo yêu cầu */}
      <div
        style={{
          borderStyle: "solid",
          borderWidth: "10px 20px",
          borderColor: "#f8fafc",
          borderRadius: "18px",
        }}
        className="h-full w-full flex items-center justify-center"
      >
        {/* card chính chiếm toàn bộ chiều cao trừ border */}
        <div className="relative bg-white rounded-2xl border border-pink-100 shadow-lg flex flex-col items-center justify-center text-center h-full w-full">
          {/* nội dung giữa */}
          <div>
            <h1 className="font-extrabold leading-tight text-[#0b1220] text-5xl sm:text-6xl md:text-7xl">
              {/* Dòng 1 */}
              <div className="flex items-center justify-center gap-4 mb-1">
                <span>Hello<span className="text-yellow-300">!</span></span>
                <span className="inline-flex items-center justify-center rounded-full">
                  <img src={helloIcon} alt="hello" className="w-28 h-28" />
                </span>
                <span>Welcome</span>
              </div>

              {/* Dòng 2 */}
              <div className="flex items-center justify-center gap-4 mb-1">
                <span>to</span>
                <span className="inline-flex items-center justify-center bg-yellow-300 rounded-md shadow-sm">
                  <img src={yellowLogo} alt="Yellow logo" className="w-22 h-22" />
                </span>
                <span className="text-outline font-extrabold text-[clamp(2rem,6vw,4.5rem)]">
                  MockAPI
                </span>
              </div>

              {/* Dòng 3 */}
              <div className="mt-2">
                <span>Platform</span>
              </div>
            </h1>

            <p className="text-gray-400 text-sm mt-6">Login to use</p>

            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center rounded-full py-4 text-md font-medium shadow-md bg-yellow-300 hover:bg-yellow-400 text-black"
            >
              <span>Start now</span>
              <ChevronRight size={36} />
            </Button>
          </div>

          {/* footer */}
          <div className="absolute left-6 bottom-4 text-xs text-gray-500">
            © Teknix Corp. All rights reserved.
          </div>

          <div className="absolute right-6 bottom-4 flex items-center gap-3 text-xs text-gray-600">
            <img src={tiktokIcon} alt="tiktok" className="w-4 h-4" />
            <img src={fbIcon} alt="facebook" className="w-4 h-4" />
            <img src={linkedinIcon} alt="linkedin" className="w-4 h-4" />
            <a className="hover:underline font-semibold" href="">About</a>
            <span>·</span>
            <a className="hover:underline font-semibold" href="">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
