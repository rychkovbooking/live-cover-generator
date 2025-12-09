import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAudioChange = (e) => {
    setAudio(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('audio', audio);
    formData.append('title', title);
    formData.append('artist', artist);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(apiUrl + '/api/render', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании видео');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>🎬 Live Cover Generator</h1>
      <p>Создай видео-обложку для YouTube за секунды</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Обложка (JPG/PNG)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Трек (WAV/MP3)</label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Название трека</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Summer Vibes"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Артист</label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Например: Taifun"
            required
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? '⏳ Создаю видео...' : '🚀 Создать видео'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {videoUrl && (
        <div className={styles.result}>
          <h2>✅ Видео готово!</h2>
          <video width="400" controls src={videoUrl}></video>
          <a href={videoUrl} download="cover.mp4" className={styles.downloadBtn}>
            ⬇️ Скачать видео
          </a>
        </div>
      )}
    </div>
  );
}
