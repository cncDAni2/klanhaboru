javascript:
fetch('https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/minified_scripts/SZEM4_released_minified.txt?d='+new Date().getTime())
  .then(response => response.arrayBuffer())
  .then(buffer => {
    const decoder = new TextDecoder('UTF-8');
	  window.eval(decoder.decode(buffer));
  });
void(0);