import { AtpAgent } from '@atproto/api';
import * as fs from 'fs';
import * as util from 'util';
import * as sizeOf from 'buffer-image-size'

const readFile = util.promisify(fs.readFile);

async function loadImageData(path: fs.PathLike) {
  let buffer = await readFile(path);
  return { data: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength), buffer: buffer };
}

type PostImageOptions = {
  path: fs.PathLike;
  text: string;
  altText: string;
};

async function postImage({ path, text, altText }: PostImageOptions) {
  const agent = new AtpAgent({ service: 'https://bsky.social' });
  await agent.login({
    identifier: process.env.BSKY_IDENTIFIER || 'BSKY_IDENTIFIER missing',
    password: process.env.BSKY_PASSWORD || 'BSKY_PASSWORD missing',
  });
  const { data, buffer } = await loadImageData(path);
  const dimensions = sizeOf(buffer);
  const testUpload = await agent.uploadBlob(data, { encoding: 'image/jpg' });
  await agent.post({
    text: text,
    embed: {
      images: [
        {
          image: testUpload.data.blob,
          alt: altText,
          aspectRatio: {
            width: dimensions.width,
            height: dimensions.height,
          },
        },
      ],
      $type: 'app.bsky.embed.images',
    },
  });
}

export { postImage };