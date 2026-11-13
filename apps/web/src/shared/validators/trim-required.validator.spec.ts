import { FormControl } from '@angular/forms';
import { trimRequiredValidator } from './trim-required.validator';

describe('trimRequiredValidator', () => {
  it('returns an error for null', () => {
    const control = new FormControl<string | null>(null);

    expect(trimRequiredValidator(control)).toEqual({ trimRequired: true });
  });

  it('returns an error for a whitespace-only string', () => {
    const control = new FormControl('   ');

    expect(trimRequiredValidator(control)).toEqual({ trimRequired: true });
  });

  it('returns an error for a string containing only tabs and line breaks', () => {
    const control = new FormControl('\n\t');

    expect(trimRequiredValidator(control)).toEqual({ trimRequired: true });
  });

  it('returns null for a non-empty trimmed value', () => {
    const control = new FormControl('  test  ');

    expect(trimRequiredValidator(control)).toBeNull();
  });

  it('returns null for a non-empty non-string value', () => {
    const control = new FormControl<number | null>(0);

    expect(trimRequiredValidator(control)).toBeNull();
  });
});
