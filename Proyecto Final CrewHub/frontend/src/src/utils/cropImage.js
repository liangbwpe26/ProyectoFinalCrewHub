export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); 
        image.src = url;
    });

export default async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Establecemos el tamaño final del canvas
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Dibujamos solo la porción seleccionada
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

    // Convertimos el canvas a un archivo Blob para poder subirlo
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('El Canvas está vacío'));
                return;
            }
            // Le damos un nombre por defecto
            blob.name = 'cropped_image.jpeg';
            
            // Convertimos el Blob en un File real para que tu servidor lo acepte sin problemas
            const file = new File([blob], "cropped_image.jpeg", { type: "image/jpeg" });
            resolve(file);
        }, 'image/jpeg', 0.9); // 0.9 es la calidad (90%)
    });
}