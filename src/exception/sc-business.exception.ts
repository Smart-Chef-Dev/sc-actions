export class ScBusinessException {
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }
}

interface IException {
  [item: string]: {
    code: number;
    message: string;
  };
}

export const ScBusinessExceptions: IException = {
  RESTAURANT_DISABLED: {
    code: 3000,
    message: 'The restaurant is blocked',
  },
};
