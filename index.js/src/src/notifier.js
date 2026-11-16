export async function sendNotification(server, topic, title, message, priority = 'default') {
  const url = `${server}/${topic}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Title': title,
      'Priority': priority,
      'Tags': 'video_game'
    },
    body: message
  });

  if (!response.ok) {
    console.error(`ntfy wysyłanie nie powiodło się: ${response.status}`);
  }
}
