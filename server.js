const OpenAI = require('openai');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const sharp = require('sharp');

// デフォルトでOpenAI APIキーは環境変数から自動取得されます
const openai = new OpenAI();
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is Running!');
});

app.post('/generate', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = imageResponse.data[0].url;
    if (!imageUrl) {
      return res.status(500).send({ error: '画像の生成に失敗しました。' });
    }

    // 成功した場合、画像URLを含むオブジェクトを返す
    res.status(200).json({ image: imageUrl });
  } catch (error) {
    res.status(500).send({
      error: '画像の生成に失敗しました。',
      details: error.message
    });
  }
});

app.post('/generateVision', async (req, res) => {
  try {
    const url = req.body.url;
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What’s in this image? Describe it in Japanese." },
            { type: "image_url", image_url: { "url": url } },
          ],
        },
      ],
    });
    res.send(response.choices[0]);
  } catch (error) {
    res.status(500).send({
      error: '説明文の生成に失敗しました。',
      details: error.message
    });
  }
});

app.post('/generateEdits', async (req, res) => {
  try {
    console.log('Request received for image edit.');

    // // 画像をリサイズする
    // console.log('Resizing image.');
    // const resizedImageBuffer = await sharp('public/santa1.png')
    //   .resize(500) // 幅を500ピクセルに設定。高さは自動調整。
    //   .toBuffer();
    // console.log('Image resized.');

    // // リサイズした画像をRGBカラースペースに変換し、PNGフォーマットで保存
    // console.log('Processing resized image with Sharp.');
    // const processedImage = await sharp(resizedImageBuffer)
    //   .toColorspace('srgb') // RGBカラースペースに変換
    //   .toFormat('png') // PNGフォーマットに変換
    //   .withMetadata() // 元のメタデータを保持
    //   .toBuffer();
    // console.log('Processed image ready to send.');

    // 元の画像のサイズを取得
    const originalImage = 'public/image_edit_original.png';
    const originalMetadata = await sharp(originalImage).metadata();

    // マスクを元の画像と同じサイズにリサイズ
    const maskImage = 'public/image_edit_mask.png';
    await sharp(maskImage)
      .resize(originalMetadata.width, originalMetadata.height)
      .toFile('public/resized_mask.png');

    const maskPath = "public/santa1_mask.png";
    if (!fs.existsSync(maskPath)) {
      throw new Error(`Mask file not found at path: ${maskPath}`);
    }

    // 変換した画像データでOpenAI APIを呼ぶ
    console.log('Sending request to OpenAI API.');
    const response = await openai.images.edit({
      image: fs.createReadStream("public/image_edit_original.png"),
      mask: fs.createReadStream("public/resized_mask.png"),
      n: 1,
      size: "256x256",
      prompt: "A cat dressed in Santa's outfit is sitting beside a dog clad in reindeer attire."
    });
    console.log('Received response from OpenAI API:', response);

    // 正しいプロパティへのアクセスを確認する
    if (response && response.data) {
      image_url = response.data[0].url;
      console.log('Sending back the image URL:', image_url);
      res.send(image_url);
    } else {
      throw new Error('Unexpected response format from OpenAI API.');
    }

  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send({
      error: 'Image generation failed.',
      details: error.message
    });
  }
});

app.listen(port, () => console.log('Listening on port', port));