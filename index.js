import { VK } from "vk-io";

const vk = new VK({
  token: process.env.VK_TOKEN
});

const GROUP_ID = Number(process.env.GROUP_ID);
const ADMIN_ID = Number(process.env.ADMIN_USER_ID);

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {

  // берём последний пост
  const wall = await vk.api.wall.get({
    owner_id: -GROUP_ID,
    count: 1
  });

  const post = wall.items[0];
  const post_id = post.id;

  // получаем комментарии
  const comments = await vk.api.wall.getComments({
    owner_id: -GROUP_ID,
    post_id,
    count: 100
  });

  // уникальные участники
  const users = [
    ...new Set(
      comments.items
        .filter(c => c.from_id > 0)
        .map(c => c.from_id)
    )
  ];

  if (!users.length) {
    await vk.api.messages.send({
      user_id: ADMIN_ID,
      random_id: Date.now(),
      message: "Сегодня нет участников."
    });
    return;
  }

  const winner = random(users);

  const link = `https://vk.com/id${winner}`;

  const message =
`🏆 Победитель дня выбран!

https://vk.com/wall-${GROUP_ID}_${post_id}

Победитель:
${link}`;

  // уведомление тебе
  await vk.api.messages.send({
    user_id: ADMIN_ID,
    random_id: Date.now(),
    message
  });

  // комментарий под постом
  await vk.api.wall.createComment({
    owner_id: -GROUP_ID,
    post_id,
    message: `🏆 Победитель дня: ${link}`
  });
}

run();
