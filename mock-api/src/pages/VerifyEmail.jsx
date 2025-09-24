import {InputOTPForm} from "@/components/InputOTP.jsx";
import bgImage from "@/assets/bg_verify_otp.svg"

export default function VerifyEmail() {
    return (
        <div className="bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${bgImage})`}}>
            <InputOTPForm />
        </div>
    )
}