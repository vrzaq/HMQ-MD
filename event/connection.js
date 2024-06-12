export async function connectionUpdate(update, start) {
  try {
    if (update.connection === 'close') {
      console.log('Info Koneksi: Menyambung!');
      start();
    } else if (update.connection === 'open') {
      const currentDate = new Date();
      console.log(`Tanggal dan Waktu Saat Ini: ${currentDate.toLocaleString()}`);
      console.log('Info Koneksi: Tersambung!');
    }
  } catch (error) {
    console.error(error);
  }
}
