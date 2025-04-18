import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordValidatorDirective,
      multi: true,
    },
  ],
})
export class PasswordValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const value = control.value as string;
    const errors: ValidationErrors = {};

    // Minimum length
    if (value.length < 8) {
      errors['minLength'] = true;
    }

    // Require uppercase
    if (!/[A-Z]/.test(value)) {
      errors['requireUppercase'] = true;
    }

    // Require lowercase
    if (!/[a-z]/.test(value)) {
      errors['requireLowercase'] = true;
    }

    // Require numbers
    if (!/[0-9]/.test(value)) {
      errors['requireNumbers'] = true;
    }

    // Require symbols
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors['requireSymbols'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  }
}
