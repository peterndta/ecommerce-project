import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {

    static  notOnlyWhitespace(control: FormControl): ValidationErrors | null {

        if((control.value != null) && (control.value.trim().length === 0)) {

            // invalid, return error object
            return {'notOnlyWhitespace': true};
        } else {

            // valid, return null
            return null;
        }
    }
}
