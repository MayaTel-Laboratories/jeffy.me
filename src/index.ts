import { postImage } from './clients/at';
import { getNextImage } from './images'; 
import * as dotenv from 'dotenv';
dotenv.config();
const CUTOFF_DATE = new Date('2000-01-01T00:00:00');
const HISTORY_LIMIT = 24;
function getDateFromFilename(filename: string): Date {
    const filenameNoJPG = filename.replace(/\.(JPG|jpeg|png|gif|bmp)$/i, "");
    return new Date(filenameNoJPG + 'T12:00:00'); 
}
function formatFullDate(dateObj: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}
function generateAltText(dateObj: Date): string {
    const formattedDate = formatFullDate(dateObj);
    if (dateObj < CUTOFF_DATE) {
        return 'A Family Circus comic strip, drawn by Bil Keane, originally released ' + formattedDate;
    } else {
        return 'A Family Circus comic strip, drawn by Bil and Jeff Keane, originally released ' + formattedDate;
    }
}
function generateCaption(dateObj: Date): string {
  const formattedDate = formatFullDate(dateObj);
  if (dateObj < CUTOFF_DATE) {
    return 'Family Circus by Bil Keane: ' + formattedDate;
  } else {
    if (dateObj.getDay() === 0) {
      return 'Sunday Family Circus by Bil and Jeff Keane: ' + formattedDate; 
    } else {
      return 'Family Circus by Bil and Jeff Keane: ' + formattedDate; 
    }
  }
}
async function main() {
  const rawHistory = process.env.LAST_IMAGE_NAME || "";
  const historyArray = rawHistory ? rawHistory.split(',') : [];
  const nextImage = await getNextImage(historyArray); 
  const imageDate = getDateFromFilename(nextImage.imageName); 
  const postText = generateCaption(imageDate);
  const postAltText = generateAltText(imageDate);
  await postImage({
    path: nextImage.absolutePath,
    text: postText,
    altText: postAltText,
  });
  const updatedHistory = [nextImage.imageName, ...historyArray].slice(0, HISTORY_LIMIT);
  process.stdout.write(updatedHistory.join(','));
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});