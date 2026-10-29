const HISTORY_KEY = 'ltw_trieuphu_history';

export const getHistory = () => {
  const savedHistory = window.localStorage.getItem(HISTORY_KEY);

  if (!savedHistory) {
    return [];
  }

  try {
    const history = JSON.parse(savedHistory);

    if (!Array.isArray(history)) {
      throw new Error('Dữ liệu lịch sử không đúng định dạng mảng.');
    }

    return history;
  } catch (error) {
    console.error('Không thể đọc lịch sử chơi đã lưu:', error);
    return [];
  }
};

export const saveHistory = (history) => {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};
