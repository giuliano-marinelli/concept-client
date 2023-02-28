import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { map, } from 'rxjs';
import { User } from '../models/user.model';

export class ExtraValidators {

  // static equals(anotherControl: FormControl): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: any } | null => {
  //     return control.value != anotherControl.value ? { equals: true } : null;
  //   };
  // }

  static usernameExists(userService: UserService, differentTo?: User): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return userService.getUsers({ username: control.value }).pipe(
        map((users) => {
          return users?.length > 0 && users[0].username != differentTo?.username ? { usernameExists: true } : null
        })
      );
    };
  }

  static emailExists(userService: UserService, differentTo?: User): AsyncValidatorFn {
    return (control: AbstractControl) => {
      return userService.getUsers({ email: control.value }).pipe(
        map((users) => {
          return users?.length > 0 && users[0].email != differentTo?.email ? { emailExists: true } : null
        })
      );
    };
  }

}
