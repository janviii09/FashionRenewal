import { IsString, IsPhoneNumber, Length } from "class-validator";

export class SendPhoneOTPDto {
  @IsPhoneNumber(null, { message: "Invalid phone number format" })
  phoneNumber: string;
}

export class VerifyPhoneOTPDto {
  @IsPhoneNumber(null)
  phoneNumber: string;

  @IsString()
  @Length(6, 6, { message: "OTP must be exactly 6 digits" })
  otp: string;
}
