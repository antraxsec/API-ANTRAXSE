// requestCounterMiddleware.js
const activeRequests = {
  count: 0
};

const requestCounterMiddleware = (io) => (req, res, next) => {
  activeRequests.count++;
  io.emit('activeRequests', activeRequests.count);

  const end = res.end;
  res.end = function (...args) {
      activeRequests.count--;
      io.emit('activeRequests', activeRequests.count);
      end.apply(this, args);
  };

  next();
};

export default requestCounterMiddleware;