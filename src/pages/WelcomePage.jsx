import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import helloIconLight from "@/assets/light/human_hello.svg";
import helloIconDark from "@/assets/dark/human_hello.svg";
import yellowLogo from "@/assets/light/yellow_logo.svg";
import blueLogo from "@/assets/dark/logo.svg";
import tiktokIcon from "@/assets/light/tiktok.svg";
import fbIcon from "@/assets/light/facebook.svg";
import linkedinIcon from "@/assets/light/linkedin.svg";
import {useTheme} from "@/services/useTheme.js";
import "@/styles/pages/auth.css"

export default function WelcomePage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const helloIcon = isDark ? helloIconDark : helloIconLight;
  const logoIcon = isDark ? blueLogo : yellowLogo;

  return (
    // nền ngoài (giữ padding/viền hồng nhạt như trước)
    <div className="auth-page h-screen w-full flex items-center justify-center px-2 py-3 sm:px-3 sm:py-4 md:px-4 md:py-5">
      {/* Viền ngoài theo yêu cầu */}
      <div className="auth-page h-full w-full flex items-center justify-center"
      >
        {/* card chính chiếm toàn bộ chiều cao trừ border */}
        <div className="auth-card relative rounded-2xl shadow-lg flex flex-col items-center justify-center text-center h-full w-full">
          {/* nội dung giữa */}
          <div>
            <h1 className="font-extrabold leading-tight text-5xl sm:text-6xl md:text-7xl">
              {/* Dòng 1 */}
              <div className="flex items-center justify-center gap-4 mb-1">
                <span>Hello<span style={{color: isDark ? "#5865F2" : "#FBEB6B"}}>!</span></span>
                <span className="inline-flex items-center justify-center rounded-full">
                  <img src={helloIcon} alt="hello" className="w-28 h-28" />
                </span>
                <span>Welcome</span>
              </div>

              {/* Dòng 2 */}
              <div className="flex items-center justify-center gap-4 mb-1">
                <span>to</span>
                <span className="inline-flex items-center justify-center rounded-md shadow-sm">
                  <img src={logoIcon} alt="Yellow logo" className="w-22 h-22" />
                </span>
                <span className="text-outline font-extrabold text-[clamp(2rem,6vw,4.5rem)]">
                  MockHub
                </span>
              </div>

              {/* Dòng 3 */}
              <div className="mt-2">
                <span>Platform</span>
              </div>
            </h1>

            <p className="text-sm font-semibold mt-6">Join the community</p>

            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center rounded-full py-4 text-md font-medium shadow-md auth-button"
            >
              <span>Start Project</span>
              <ChevronRight size={36} />
            </Button>
          </div>

          {/* footer */}
          <div className="absolute left-6 bottom-4 text-xs">
            © Teknix Corp. All rights reserved.
          </div>

          <div className="absolute right-6 bottom-4 flex items-center gap-3 text-xs text-gray-600">
            <img src={tiktokIcon} alt="tiktok" className="w-4 h-4 invert" />
            <img src={fbIcon} alt="facebook" className="w-4 h-4 invert" />
            <img src={linkedinIcon} alt="linkedin" className="w-4 h-4 invert" />
            <a className="hover:underline" href="">About</a>
            <span>·</span>
            <a className="hover:underline" href="">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
