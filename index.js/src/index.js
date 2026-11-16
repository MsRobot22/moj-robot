import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchPrice } from './scraper.js';
import { shouldNotify, getLowestPrice } from './history.js';
import { sendNotification } from './notifier.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf-8'));

async function checkAllGames() {
  console.log(`[${new Date().toISOString()}] Rozpoczęcie sprawdzania cen...`);

  for (const game of config.games) {
    try {
      const price = await fetchPrice(game.url);

      if (price === null) {
        console.warn(`  ⚠️ ${game.name}: nie udało się odczytać ceny (strona mogła się zmienić lub wystąpił problem z siecią)`);
        continue;
      }

      console.log(`  📊 ${game.name}: bieżąca cena ${price} zł`);

      const should = shouldNotify(game.name, price);

      if (should) {
        const oldLowest = getLowestPrice(game.name);
        // getLowestPrice zwraca już zaktualizowaną cenę, więc do komunikatu użyj bieżącej ceny
        const msg = `${game.name}\nBieżąca cena: ${price} zł\n(Najniższa w historii została zaktualizowana)\n${game.url}`;
        await sendNotification(
          config.ntfyServer,
          config.ntfyTopic,
          `🎮 Spadek ceny: ${game.name}`,
          msg,
          'high'
        );
        console.log(`  ✅ Wysłano powiadomienie o spadku ceny`);
      } else {
        console.log(`  ⏭️ Pominięto powiadomienie (brak nowego minimum)`);
      }
    } catch (err) {
      console.error(`  ❌ ${game.name} błąd: ${err.message}`);
    }
  }

  console.log(`[${new Date().toISOString()}] Sprawdzanie zakończone\n`);
}

// Uruchomienie początkowe
checkAllGames();

// Uruchomienie cykliczne
const intervalMs = config.checkIntervalHours * 60 * 60 * 1000;
setInterval(checkAllGames, intervalMs);

console.log(`Bot uruchomiony, sprawdzanie co ${config.checkIntervalHours} godzin. Naciśnij Ctrl+C, aby zakończyć.`);
