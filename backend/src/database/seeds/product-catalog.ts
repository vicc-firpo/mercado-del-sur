export interface CatalogProduct {
  name: string;
  description: string;
  price: string;
  imageUrls: [string, string, string];
}

const img = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?w=900&q=80&fm=jpg&fit=crop`;

export const PRODUCT_CATALOG: CatalogProduct[] = [
  {
    name: 'Sofá de tres cuerpos en lino',
    description:
      'Sofá de tres cuerpos tapizado en lino de tono neutro, con almohadones de vellón y patas de madera maciza. Cómodo y fácil de combinar con cualquier ambiente.',
    price: '48900.00',
    imageUrls: [
      img('1578500494198-246f612d3b3d'),
      img('1493663284031-b7e3aefcae8e'),
      img('1555041469-a586c61ea9bc'),
    ],
  },
  {
    name: 'Sofá seccional modular en L',
    description:
      'Sistema modular que se arma en L o en U según el espacio, tapizado en tejido resistente color gris. Incluye chaise longue reversible.',
    price: '72900.00',
    imageUrls: [
      img('1550581190-9c1c48d21d6c'),
      img('1616486338812-3dadae4b4ace'),
      img('1618221195710-dd6b41faaea6'),
    ],
  },
  {
    name: 'Sofá de dos cuerpos de tela',
    description:
      'Sofá compacto de dos cuerpos ideal para living pequeño o monoambiente. Estructura de madera y espuma de alta densidad.',
    price: '32900.00',
    imageUrls: [
      img('1558211583-d26f610c1eb1'),
      img('1567016432779-094069958ea5'),
      img('1540638349517-3abd5afc5847'),
    ],
  },
  {
    name: 'Sofá de cuero de tres cuerpos',
    description:
      'Sofá de cuero flor entera color suela que toma pátina con el uso, sobre patas de madera. Costuras reforzadas y asientos desmontables.',
    price: '89900.00',
    imageUrls: [
      img('1540574163026-643ea20ade25'),
      img('1615873968403-89e068629265'),
      img('1552242718-c5360894aecd'),
    ],
  },
  {
    name: 'Sillón individual de terciopelo',
    description:
      'Sillón de respaldo capitoné en terciopelo, sobre patas torneadas. Un asiento de acento para el dormitorio o un rincón del living.',
    price: '15900.00',
    imageUrls: [
      img('1567538096630-e0c55bd6374c'),
      img('1567538096621-38d2284b23ff'),
      img('1556228453-efd6c1ff04f6'),
    ],
  },
  {
    name: 'Butaca de bouclé con puff',
    description:
      'Butaca de líneas redondeadas tapizada en bouclé, con puff a juego. Espuma firme y base giratoria.',
    price: '18500.00',
    imageUrls: [
      img('1631679706909-1844bbd07221'),
      img('1550226891-ef816aed4a98'),
      img('1580480055273-228ff5388ef8'),
    ],
  },
  {
    name: 'Sillón de lectura con apoyapiés',
    description:
      'Sillón envolvente con respaldo alto y apoyapiés independiente, pensado para leer. Tapizado en tejido de mezcla de lana.',
    price: '22900.00',
    imageUrls: [
      img('1611967164521-abae8fba4668'),
      img('1586023492125-27b2c045efd7'),
      img('1560448204-e02f11c3d0e2'),
    ],
  },
  {
    name: 'Juego de dos sillas de comedor',
    description:
      'Par de sillas de comedor con carcasa moldeada y patas de madera maciza. Apilables y livianas.',
    price: '8900.00',
    imageUrls: [
      img('1592078615290-033ee584e267'),
      img('1554295405-abb8fd54f153'),
      img('1617806118233-18e1de247200'),
    ],
  },
  {
    name: 'Cama de madera maciza',
    description:
      'Cama de madera maciza de línea baja, con respaldo de listones y base con somier de tablas. Disponible en 1 y 2 plazas.',
    price: '27900.00',
    imageUrls: [
      img('1616627561839-074385245ff6'),
      img('1615874959474-d609969a20ed'),
      img('1522771739844-6a9f6d5f14af'),
    ],
  },
  {
    name: 'Cama con cabecera tapizada',
    description:
      'Cama con cabecera acolchada y tapizada en tejido color topo, sobre estructura reforzada. El acolchado llega hasta el piso.',
    price: '31500.00',
    imageUrls: [
      img('1560448205-4d9b3e6bb6db'),
      img('1616486029423-aaa4789e8c9a'),
      img('1615529162924-f8605388461d'),
    ],
  },
  {
    name: 'Mesa de luz de dos cajones',
    description:
      'Mesa de luz en madera clara con dos cajones de cierre suave y tirador embutido. Combina con las camas de la línea.',
    price: '6400.00',
    imageUrls: [
      img('1532372320572-cda25653a26d'),
      img('1611486212557-88be5ff6f941'),
      img('1522771739844-6a9f6d5f14af'),
    ],
  },
  {
    name: 'Mesa de comedor extensible',
    description:
      'Mesa de comedor de madera con tabla de extensión central: pasa de seis a ocho lugares. Terminación al aceite.',
    price: '34900.00',
    imageUrls: [
      img('1602872030219-ad2b9a54315c'),
      img('1600607687920-4e2a09cf159d'),
      img('1522708323590-d24dbb6b0267'),
    ],
  },
  {
    name: 'Mesa de centro redonda',
    description:
      'Mesa de centro redonda de madera con estante inferior. Bordes redondeados, ideal para espacios de paso.',
    price: '11900.00',
    imageUrls: [
      img('1560185127-6ed189bf02f4'),
      img('1583847268964-b28dc8f51f92'),
      img('1616137466211-f939a420be84'),
    ],
  },
  {
    name: 'Aparador de tres puertas',
    description:
      'Aparador bajo con tres puertas y estantes internos regulables. Frente de madera con tiradores metálicos.',
    price: '29900.00',
    imageUrls: [
      img('1567016526105-22da7c13161a'),
      img('1594026112284-02bb6f3352fe'),
      img('1524634126442-357e0eac3c14'),
    ],
  },
  {
    name: 'Cómoda de cinco cajones',
    description:
      'Cómoda alta de cinco cajones amplios con guías metálicas. Buena opción para el dormitorio cuando falta placard.',
    price: '19900.00',
    imageUrls: [
      img('1567225557594-88d73e55f2cb'),
      img('1513694203232-719a280e022f'),
      img('1513161455079-7dc1de15ef3e'),
    ],
  },
  {
    name: 'Biblioteca modular',
    description:
      'Biblioteca de estantes abiertos que se puede montar en varias alturas y anchos. Estructura de madera con refuerzos de acero.',
    price: '21500.00',
    imageUrls: [
      img('1594620302200-9a762244a156'),
      img('1595428774223-ef52624120d2'),
      img('1600121848594-d8644e57abab'),
    ],
  },
  {
    name: 'Lámpara de mesa de cerámica',
    description:
      'Lámpara de mesa con base de cerámica esmaltada y pantalla de lino natural. Da una luz cálida y difusa.',
    price: '2790.00',
    imageUrls: [
      img('1517991104123-1d56a6e81ed9'),
      img('1533090161767-e6ffed986c88'),
      img('1540932239986-30128078f3c5'),
    ],
  },
  {
    name: 'Lámpara de pie de arco',
    description:
      'Lámpara de pie de brazo curvo con base pesada y foco regulable. Llega por encima del sofá sin ocupar lugar en el piso.',
    price: '6900.00',
    imageUrls: [
      img('1524758631624-e2822e304c36'),
      img('1586023492125-27b2c045efd7'),
      img('1519710164239-da123dc03ef4'),
    ],
  },
  {
    name: 'Alfombra tejida a mano',
    description:
      'Alfombra de trama plana tejida a mano en lana, con flecos y motivos geométricos. Reversible y de uso intensivo.',
    price: '8400.00',
    imageUrls: [
      img('1594040226829-7f251ab46d80'),
      img('1600166898405-da9535204843'),
      img('1616593969747-4797dc75033e'),
    ],
  },
  {
    name: 'Butaca de fibra natural',
    description:
      'Butaca de ratán trenzado a mano sobre estructura de madera dura, con almohadón lavable. Sirve para interior o galería techada.',
    price: '9900.00',
    imageUrls: [
      img('1519961655809-34fa156820ff'),
      img('1616593969747-4797dc75033e'),
      img('1615529162924-f8605388461d'),
    ],
  },
  {
    name: 'Espejo redondo de pared',
    description:
      'Espejo circular con marco fino metálico y colgado oculto. Queda bien sobre un aparador, en el recibidor o el baño.',
    price: '4200.00',
    imageUrls: [
      img('1604709177225-055f99402ea3'),
      img('1618220179428-22790b461013'),
      img('1617806118233-18e1de247200'),
    ],
  },
  {
    name: 'Escritorio compacto',
    description:
      'Escritorio de tamaño reducido con tapa de madera y un cajón, apto para rincón de trabajo o estudio. Pasa cables en la parte de atrás.',
    price: '12900.00',
    imageUrls: [
      img('1449247709967-d4461a6a6103'),
      img('1533090161767-e6ffed986c88'),
      img('1533090368676-1fd25485db88'),
    ],
  },
  {
    name: 'Banco de entrada de madera',
    description:
      'Banco para el recibidor con asiento de madera y estante inferior para calzado. Aguanta el uso diario de toda la familia.',
    price: '7200.00',
    imageUrls: [
      img('1516455207990-7a41ce80f7ee'),
      img('1616486029423-aaa4789e8c9a'),
      img('1615529162924-f8605388461d'),
    ],
  },
  {
    name: 'Mesa auxiliar de arrimo',
    description:
      'Mesa angosta de arrimo para detrás del sofá o contra una pared. Madera maciza con dos niveles de apoyo.',
    price: '5600.00',
    imageUrls: [
      img('1526057565006-20beab8dd2ed'),
      img('1611486212557-88be5ff6f941'),
      img('1522708323590-d24dbb6b0267'),
    ],
  },
];
