// Este código es una función que recorta una imagen dada una URL y las coordenadas de recorte.
export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); 
        image.src = url;
    });

// La función getCroppedImg toma la URL de la imagen y las coordenadas de recorte, crea un canvas, 
// dibuja la imagen recortada en el canvas y devuelve un archivo Blob con la imagen recortada.
export default async function getCroppedImg(imageSrc, pixelCrop) {
    // Crea una imagen a partir de la URL proporcionada
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Si no se puede obtener el contexto del canvas, devuelve null
    if (!ctx) return null;

    // Establece el tamaño del canvas al tamaño del recorte
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Dibuja la imagen recortada en el canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Convierte el contenido del canvas a un Blob y luego a un archivo, y lo devuelve como una promesa
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('El Canvas está vacío'));
                return;
            }
            blob.name = 'cropped_image.jpeg';
            
            const file = new File([blob], "cropped_image.jpeg", { type: "image/jpeg" });
            resolve(file);
        }, 'image/jpeg', 0.9);
    });
}