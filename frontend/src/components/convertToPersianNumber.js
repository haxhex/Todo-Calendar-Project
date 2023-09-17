import PersianJs from 'persianjs';

function convertToPersianNumber(number) {
  return new PersianJs(number).englishNumber().toString();
}

export { convertToPersianNumber };
