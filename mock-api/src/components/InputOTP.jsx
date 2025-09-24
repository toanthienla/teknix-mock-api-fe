"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { z } from "zod"
import { REGEXP_ONLY_DIGITS } from "input-otp"

import { Button } from "@/components/ui/button.jsx"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp.jsx"
import React from "react";

const FormSchema = z.object({
  pin: z
    .string()
    .regex(/^\d{6}$/, "Your one-time password must be exactly 6 digits."),
})

export function InputOTPForm() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  })

  function onSubmit(data) {
    toast.success("You submitted the following values: " + data.pin);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 max-w-md space-y-6 text-center"
        >
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Verify Your Email</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormDescription>
                  <div className="mt-4 text-center text-sm">
                    Enter the code we’ve sent to your inbox
                  </div>
                  <div className="mt-2 text-center text-sm">
                    Didn&apos;t get the code?{" "}
                    <a href="/signup" className="font-bold text-black underline underline-offset-4">
                      Resend it
                    </a>
                  </div>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="bg-blue-600 hover:bg-blue-700" type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}
