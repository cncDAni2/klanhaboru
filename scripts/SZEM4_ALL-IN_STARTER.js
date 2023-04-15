javascript:
fetch('https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/scripts/SZEM4_minified.txt?d='+new Date().getTime())
  .then(response => response.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('UTF-8');
    const text = decoder.decode(buffer);
    eval(text);
  });
void(0);