# 🎰 Bucket List · Arcade

Una experiencia tipo máquina recreativa: pulsas un botón y el "dado" te
asigna **una misión al azar** de tu lista. Después tienes que esperar
**1 hora** para poder volver a tirar.

## Qué hace

- **Un botón** que sortea una actividad de tu lista.
- **Animación retro**: un dado ASCII que rueda y un texto que se
  "descifra" letra a letra hasta revelar tu misión.
- **Temporizador de 1 hora**: al obtener una misión, el botón se bloquea
  y aparece una cuenta atrás. Aunque cierres o recargues la página, la
  espera se mantiene (se guarda en tu navegador).
- **Sonido arcade** opcional (se puede silenciar).

## Cómo verlo

Abre el archivo **`index.html`** con doble clic. No necesitas instalar nada.

> Para publicarlo en internet: sube esta carpeta a GitHub y activa
> *GitHub Pages*. El proyecto es solo HTML, CSS y JavaScript, sin
> dependencias ni pasos de compilación.

## Cómo cambiar las actividades

Abre el archivo **`bucketlist.js`** y edita la lista. Cada actividad va
entre comillas y separada por una coma. Nada más. Ejemplo:

```js
const BUCKET_LIST = [
  "Ver un amanecer desde un sitio alto",
  "Aprender a hacer pan",
  "Escribir a un amigo lejano",
];
```

## Ajustes rápidos

En **`app.js`**, arriba del todo:

- `COOLDOWN_MS` → cuánto hay que esperar entre tiradas (por defecto 1 hora).
- `ROLL_MS` → cuánto dura la animación del sorteo.

## Archivos del proyecto

| Archivo | Para qué sirve |
|---|---|
| `index.html` | La página que se abre. |
| `styles.css` | Toda la estética (colores, brillos, efecto CRT). |
| `app.js` | La lógica: sorteo, animación y temporizador. |
| `bucketlist.js` | **Tu base de datos**: la lista de actividades. |

---

## Prompt para replicar esto en Claude Code

> "Quiero una experiencia web (HTML, CSS y JS puros, sin frameworks) con
> un botón que saque al azar una actividad de una lista guardada en un
> archivo aparte que funcione como base de datos. Al pulsar, quiero una
> animación retro con un dado ASCII y un temporizador que bloquee el
> botón durante 1 hora, recordando la espera aunque se recargue la
> página. Estética arcade/CRT muy cuidada."
