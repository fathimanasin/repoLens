const { io } = require('socket.io-client');

const socket = io(
  'http://localhost:3001/analysis',
);

socket.on('connect', () => {
  console.log(
    'CONNECTED',
    socket.id,
  );

  socket.emit(
    'subscribe',
    {
      repositoryId:
        '3c1265c2-ecf0-48ef-bb6c-bfeceee8fd78',
    },
  );
});

socket.on(
  'subscribed',
  (data) => {
    console.log(
      'SUBSCRIBED',
      data,
    );
  },
);

socket.on(
  'progress',
  (data) => {
    console.log(
      'PROGRESS',
      data,
    );
  },
);