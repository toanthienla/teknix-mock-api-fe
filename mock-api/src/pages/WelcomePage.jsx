import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-gradient-to-bl from-[#2563EB] to-[#ffffff] text-center">
      <div className="mb-4">
        <h1 className="text-5xl sm:text-6xl font-semibold leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#000000] via-[#ffffff] to-[#ffffff] block">
            Hello! Welcome to
          </span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#000000] via-[#ffffff] to-[#ffffff] block">
            MockAPI Platform
          </span>
        </h1>
      </div>

      <p className="text-white text-lg mb-8">Login to use</p>

      <Button
        onClick={() => navigate("/login")}
        className="flex bg-blue-600 hover:bg-blue-700 shadow-md rounded-md"
      >
        Login <ChevronRight size={36} />
      </Button>
    </div>
  );
}
