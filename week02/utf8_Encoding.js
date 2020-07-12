function UTF8_Encoding(string) {
  const arr = encodeURIComponent(string).split("");
  const arr2 = arr.filter((letter) => letter === "%");
  const length = arr.length - 2 * arr2.length;
  const res = new ArrayBuffer(length);
  let [i, j] = [0, 0];
  while (i < arr.length) {
    let letter = arr[i];
    if (letter === "%") {
      const hex = arr[i + 1] + arr[i + 2];
      const hexVal = parseInt(hex, 16);
      res[j] = hexVal;
      i += 3;
    } else {
      res[j] = letter.charCodeAt(0);
    }
    j += 1;
  }
  return res;
}

UTF8_Encoding("发送到大");
