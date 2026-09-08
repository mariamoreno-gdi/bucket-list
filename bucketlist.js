// =====================================================
//  BUCKET LIST · Listas por estación
// =====================================================
//
//  Cada estación tiene su propia lista. Para editar,
//  añade o quita actividades dentro de la estación
//  correspondiente. Para añadir invierno o primavera,
//  crea una nueva clave: winter: [ ... ] o spring: [ ... ]
//
//  Las estaciones cambian automáticamente:
//    Verano:  21 junio – 20 septiembre
//    Otoño:   21 septiembre – 20 diciembre
//    Invierno: 21 diciembre – 19 marzo
//    Primavera: 20 marzo – 20 junio
// =====================================================

const SEASONS = {

  summer: [
    "Ver un amanecer desde un sitio alto",
    "Ir al cine de verano",
    "Escribir una carta a mano y enviarla por correo",
    "Ver tu película favorita de la infancia",
    "Paseo nocturno a comprar un helado",
    "Aprender a decir hola en cinco idiomas",
    "Visitar un museo que nunca hayas pisado",
    "Plantar lentejas en un yogurt",
    "Comprar papelería para la vuelta al cole",
    "Llamar a alguien con quien hace tiempo que no hablas",
    "Pintar piedras para decorar una maceta",
    "Ir a un concierto de un grupo que no conoces",
    "Dar un paseo en bici",
    "Enmarcar un dibujo tuyo con orgullo",
    "Aprender los nombres de cinco constelaciones",
    "Volar una cometa",
    "Bañarte en el mar fuera de temporada",
    "Escribir una poesía para alguien que quieras",
    "Hacer una corona de flores",
    "Jugar a tu juego favorito de la infancia",
    "Hacer un picnic en el parque",
    "Comprarte flores porque sí",
    "Perderte a propósito por el barrio",
    "Ver tus dibujos animados de la infancia",
    "Escuchar tu grupo favorito de la adolescencia",
    "Leer el primer libro que te marcó",
    "Hacer una pulsera de hilo para regalar",
  ],

  autumn: [
    "Bailar bajo la lluvia",
    "Comer castañas",
    "Ver \"Tienes un email\"",
    "Ver \"Pesadilla antes de Navidad\"",
    "Ver \"El club de los poetas muertos\"",
    "Ir a una biblioteca bonita",
    "Leer en una cafetería",
    "Sentarte frente a una chimenea",
    "Aprender a tejer una bufanda",
    "Pintar con acuarelas",
    "Tomarte un té sin mirar el móvil",
    "Leer \"El secreto\" de Donna Tartt",
    "Escuchar un disco entero seguido",
    "Pisar hojas secas",
    "Pisar charcos",
    "Empieza a escribir un diario",
    "Ver \"Amelie\"",
    "Escribe una carta a alguien que quieras",
    "Escribe una carta a tu yo de 8 años",
    "Escribe una carta a tu yo de 80 años",
  ],

};

// No toques esta línea
window.SEASONS = SEASONS;
