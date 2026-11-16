import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HISTORY_PATH = path.join(__dirname, '..', 'history.json');

function loadHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * Zwraca true, jeśli należy wysłać powiadomienie.
 * Logika: wysyłaj tylko przy pierwszym sprawdzeniu lub gdy cena spadnie poniżej najniższej w historii.
 */
export function shouldNotify(gameName, currentPrice) {
  const history = loadHistory();
  const record = history[gameName];

  // Pierwsze sprawdzenie: zapisz i nie powiadamiaj (unikaj spamu przy starcie)
  if (!record) {
    history[gameName] = { lowestPrice: currentPrice, lastChecked: new Date().toISOString() };
    saveHistory(history);
    return false;
  }

  const shouldSend = currentPrice < record.lowestPrice;

  if (shouldSend) {
    record.lowestPrice = currentPrice;
  }
  record.lastChecked = new Date().toISOString();
  saveHistory(history);

  return shouldSend;
}

export function getLowestPrice(gameName) {
  const history = loadHistory();
  return history[gameName]?.lowestPrice ?? null;
}
