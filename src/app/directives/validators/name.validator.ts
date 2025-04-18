import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appNameValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: NameValidatorDirective,
      multi: true,
    },
  ],
})
export class NameValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const value = control.value as string;

    // Check for spaces
    if (value.includes(' ')) {
      return { hasSpaces: true };
    }

    // Check length
    if (value.length > 14) {
      return { tooLong: true };
    }

    // Check for allowed special characters (only _ and -)
    const nameRegex = /^[a-zA-Z0-9_-]+$/;
    const isValid = nameRegex.test(value);

    return isValid ? null : { invalidCharacters: true };
  }
}
