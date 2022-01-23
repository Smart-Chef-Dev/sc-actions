export class ScBusinessException {
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}

export const ScBusinessExceptions = {
  RESTAURANT_DISABLED: {
    code: 3000,
    message: 'The restaurant is blocked',
  },
};
