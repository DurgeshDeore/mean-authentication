import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp-verify',
  templateUrl: './otp-verify.component.html',
  styleUrls: ['./otp-verify.component.css']
})
export class OtpVerifyComponent {
  otpForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isResending: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]]
    });

    // Automatically send OTP when component loads
    this.sendOtp();
  }

  sendOtp(): void {
    this.isResending = true;
    this.authService.sendOtp().subscribe({
      next: () => {
        this.successMessage = 'OTP sent to your email!';
        this.isResending = false;
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to send OTP';
        this.isResending = false;
      }
    });
  }

  resendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.authService.resendOtp().subscribe({
      next: () => {
        this.successMessage = 'New OTP sent to your email!';
      },
      error: (err) => {
        this.errorMessage = err.error.message || 'Failed to resend OTP';
      }
    });
  }

  onSubmit(): void {
    if (this.otpForm.valid) {
      this.authService.verifyOtp(this.otpForm.value.otp).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: { error: { message: string; }; }) => {
          this.errorMessage = err.error.message || 'OTP verification failed';
        }
      });
    }
  }
}