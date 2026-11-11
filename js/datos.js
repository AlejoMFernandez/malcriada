window.MALCRI = (() => {
  const PROD = {
    cheesecake: { kit: 'te-cheesecake', cta: 'Encargar la entera', n: 'Cheesecake malcriada', c: 'Cheesecake', d: 'Crema de choco blanco, frambuesas y pistachos. La de la casa.', p: 'Porción $18.500 · entera (26 cm) $140.000', img: 'l-cheesecake', precio: 18500 },
    alfajor: { ir: '#alfajores', cta: 'Elegir sabor', n: 'Alfajores xxxl', c: 'Alfajor xxxl', d: 'Limón, pistachos y choco blanco · chocotorta triple · corazón de frambuesa.', p: '$10.000 cada uno', img: 'l-alfajor', precio: 10000 },
    cookie: { kit: 'ck-pistacho', n: 'Cookie pistacho', c: 'Cookie pistacho', d: 'Pistacho 100 % y choco blanco, rellena de praliné casero de pistacho.', p: '$8.700', img: 'l-cookie', precio: 8700 },
    brownie: { n: 'Brownie cheesecake', c: 'Brownie cheesecake', d: 'El brownie abajo y el cheesecake arriba, en una sola porción.', p: '$10.200', img: 'l-brownie', precio: 10200 },
    danesa: { n: 'Danesa xl', c: 'Danesa xl', d: 'De estación: la fruta cambia según el día.', p: '$6.800', img: 'l-danesa', precio: 6800 },
    matilda: { kit: 'te-matilda', cta: 'Encargar la entera', n: 'Torta Matilda', d: 'Capas de chocolate con ganache. Para fans del chocolate.', p: 'Porción $18.500 · entera $140.000', img: 'l-matilda', precio: 18500 },
    medialuna: { n: 'Medialuna rellena', c: 'Medialuna rellena', d: 'Con pastelera de pistacho, o con pastelera y dulce de leche.', p: '$5.700', img: 'l-medialuna', precio: 5700 },
  };
  const LATA = ['cheesecake', 'alfajor', 'cookie', 'medialuna', 'danesa', 'matilda', 'brownie'];

  const foto = (src, alt, lazy) => `<div class="ph"><img src="img/${src}.webp" alt="${alt}" ${lazy ? 'loading="lazy"' : ''} draggable="false"></div>`;
  const lata = () => LATA.map((k, i) => {
    const a = (i - 1) * 60 - 90, r = i ? 31 : 0;
    const x = 50 + r * Math.cos(a * Math.PI / 180), y = 50 + r * Math.sin(a * Math.PI / 180);
    return `<button class="celda c${i}" data-k="${k}" style="left:${x}%;top:${y}%;transition-delay:${0.12 + i * 0.05}s" aria-label="${PROD[k].n}" tabindex="-1">${foto(PROD[k].img, '', true)}</button>`;
  }).join('');
  return { PROD, LATA, foto, lata };
})();
