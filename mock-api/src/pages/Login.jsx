import { LoginForm } from "@/components/LoginForm.jsx"
import loginImage from '@/assets/loginImage.png'

export default function LoginPage() {


    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            <div className="relative hidden lg:flex flex-col justify-between p-8 bg-muted">
                <div className="absolute inset-0">
                    <img
                        src={loginImage}
                        alt="Login illustration"
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="relative z-10 p-6">
                    <h1 className="text-lg font-semibold">MockAPI</h1>
                </div>
                <div className="relative z-10 mt-auto text-left text-black p-6">
                    <h2 className="mt-4 text-xl font-bold">
                        The easiest way to mock REST APIs
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                        Quickly setup endpoints, generate custom data, and perform operations on it using RESTful interface
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <LoginForm />
                </div>
            </div>
        </div>
    )


}
