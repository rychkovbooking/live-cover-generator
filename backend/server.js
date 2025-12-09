const express = require('express');
const multer = require('multer');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 },
});

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');

app.post('/api/render', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]), async (req, res) => {
  try {
    const { title, artist } = req.body;
    const imagePath = req.files.image[0].path;
    const audioPath = req.files.audio[0].path;
    const outputPath = `uploads/output_${Date.now()}.mp4`;

    const videoWidth = 1280;
    const videoHeight = 720;

    return new Promise((resolve, reject) => {
      ffmpeg(imagePath)
        .loop(0)
        .withInputFps(30)
        .input(audioPath)
        .withVideoCodec('libx264')
        .withAudioCodec('aac')
        .outputOptions([
          `-vf "scale=${videoWidth}:${videoHeight},drawtext=fontfile=/Library/Fonts/Arial.ttf:text='${title}':fontsize=48:fontcolor=white:x=100:y=200,drawtext=fontfile=/Library/Fonts/Arial.ttf:text='${artist}':fontsize=36:fontcolor=white:x=100:y=350"`
        ])
        .output(outputPath)
        .on('start', () => {
          console.log('Начинаю создавать видео...');
        })
        .on('progress', (progress) => {
          console.log('Прогресс: ' + Math.round(progress.percent) + '%');
        })
        .on('error', (err) => {
          console.error('Ошибка FFmpeg:', err.message);
          res.status(500).json({ error: err.message });
          reject(err);
        })
        .on('end', () => {
          console.log('Видео готово!');
          res.download(outputPath, 'cover.mp4', (err) => {
            setTimeout(() => {
              fs.unlink(imagePath, () => {});
              fs.unlink(audioPath, () => {});
              fs.unlink(outputPath, () => {});
            }, 1000);
          });
          resolve();
        })
        .run();
    });
  } catch (error) {
    console.error('Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend запущен на http://localhost:${PORT}`);
});
