import {SignupForm} from "@/components/SignupForm.jsx"
import signupImage from '@/assets/signupImage.svg'

export default function SignupPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <SignupForm/>
        </div>
      </div>

      <div className="relative hidden lg:flex flex-col justify-between p-8 bg-muted">
        <div className="absolute inset-0">
          <img
            src={signupImage}
            alt="Signup Image"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative z-10 p-6">
          <h1 className="text-lg font-semibold text-white">MockAPI</h1>
        </div>
        <div className="relative z-10 mt-auto text-left text-black p-6">
          <h2 className="mt-4 text-xl font-semibold">
            The easiest way to mock REST APIs
          </h2>
          <p className="mt-2 text-sm max-w font-semibold">
            Quickly setup endpoints, generate custom data, and perform operations on it using RESTful interface
          </p>
        </div>
      </div>
    </div>
  )
}
