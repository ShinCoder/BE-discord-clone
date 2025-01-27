import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { CustomErrorMessage } from 'shared/constants';

import { AGE_RESTRICTION } from '../constants';

dayjs.extend(customParseFormat);

@ValidatorConstraint({ async: false })
export class AgeRestrictConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const age = dayjs().diff(dayjs(value, 'YYYY-MM-DD'), 'year');
    return age >= AGE_RESTRICTION;
  }

  defaultMessage() {
    return CustomErrorMessage.REGISTER__AGE_RESTRICTION_VIOLATED;
  }
}

@ValidatorConstraint({ async: false })
export class DateConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    const date = dayjs(value, 'YYYY-MM-DD', true);

    return date.isValid();
  }

  defaultMessage() {
    return 'Invalid date';
  }
}
