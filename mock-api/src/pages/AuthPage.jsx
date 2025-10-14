import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import loginImage from "@/assets/loginImage.svg";
import signupImage from "@/assets/signupImage.svg";

export default function AuthPage() {
  const [page, setPage] = useState("welcome");
  const [direction, setDirection] = useState(0);

  const variants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5 },
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
    exit: (dir) => ({
      x: dir > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.35, ease: "easeIn" },
    }),
  };

  const goTo = (nextPage) => {
    if (page === nextPage) return;
    if (page === "welcome" && nextPage === "login") setDirection(1);
    else if (page === "welcome" && nextPage === "signup") setDirection(-1);
    else if (page === "login" && nextPage === "signup") setDirection(-1);
    else if (page === "signup" && nextPage === "login") setDirection(1);
    else setDirection(0);
    setPage(nextPage);
  };

  return (
    <div className="relative flex justify-center items-center h-screen w-screen overflow-hidden bg-gradient-to-bl from-[#2563EB] to-[#ffffff]">
      <AnimatePresence mode="wait" custom={direction}>
        {/* --- Welcome Page --- */}
        {page === "welcome" && (
          <motion.div
            key="welcome"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex flex-col justify-center items-center text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-semibold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#000000] via-[#ffffff] to-[#ffffff] block">
                Hello! Welcome to
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#000000] via-[#ffffff] to-[#ffffff] block">
                MockAPI Platform
              </span>
            </h1>
            <p className="text-white text-lg mb-8">Login or Sign up to continue</p>

            <div className="flex gap-4">
              <Button
                onClick={() => goTo("login")}
                className="flex bg-blue-600 hover:bg-blue-700 shadow-md rounded-md"
              >
                Login <ChevronRight size={20} />
              </Button>
              <Button
                onClick={() => goTo("signup")}
                className="flex bg-white text-blue-700 hover:bg-gray-100 shadow-md rounded-md"
              >
                Sign Up <ChevronRight size={20} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- Login Page --- */}
        {page === "login" && (
          <div className="grid min-h-screen min-w-screen lg:grid-cols-2 bg-white">
            {/* Cột ảnh có animation */}
            <motion.div
              key="loginImage"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative hidden lg:flex flex-col justify-between p-8 bg-white"
            >
              <img src={loginImage} alt="Login" className="absolute inset-0 h-full w-full object-cover" />
              <div className="relative z-10 p-6">
                <h1 className="text-3xl font-semibold text-black">MockAPI</h1>
              </div>
              <div className="relative z-10 mt-auto text-left text-white p-6">
                <h2 className="mt-4 text-xl font-bold">The easiest way to mock REST APIs</h2>
                <p className="mt-2 text-white text-sm">
                  Quickly setup endpoints, generate custom data, and perform operations on it using RESTful interface
                </p>
              </div>
            </motion.div>

            {/* Cột form đứng yên */}
            <div className="flex flex-col items-center justify-center p-6 relative">
              <Button
                onClick={() => goTo("welcome")}
                variant="ghost"
                className="absolute top-6 left-6 flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </Button>
              <div className="w-full max-w-sm">
                <LoginForm onSwitchPage={goTo} />
              </div>
            </div>
          </div>
        )}

        {/* --- Signup Page --- */}
        {page === "signup" && (
          <div className="grid min-h-screen min-w-screen lg:grid-cols-2 bg-white">
            {/* Cột form đứng yên */}
            <div className="flex flex-col items-center justify-center p-6 relative">
              <Button
                onClick={() => goTo("welcome")}
                variant="ghost"
                className="absolute top-6 left-6 flex items-center gap-2"
              >
                <ArrowLeft size={18} /> Back
              </Button>
              <div className="w-full max-w-sm">
                <SignupForm onSwitchPage={goTo} />
              </div>
            </div>

            {/* Cột ảnh có animation */}
            <motion.div
              key="signupImage"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative hidden lg:flex flex-col justify-between p-8 bg-muted"
            >
              <img src={signupImage} alt="Signup" className="absolute inset-0 h-full w-full object-cover" />
              <div className="relative z-10 p-6">
                <h1 className="text-3xl font-semibold text-white">MockAPI</h1>
              </div>
              <div className="relative z-10 mt-auto text-left text-black p-6">
                <h2 className="mt-4 text-xl font-semibold">The easiest way to mock REST APIs</h2>
                <p className="mt-2 text-sm font-semibold">
                  Quickly setup endpoints, generate custom data, and perform operations on it using RESTful interface
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
