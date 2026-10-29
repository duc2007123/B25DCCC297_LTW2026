import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App';
import questions from '../public/data/questions.json';

jest.mock('axios', () => ({
  get: jest.fn(),
  isCancel: jest.fn(() => false),
}));

beforeEach(() => {
  window.localStorage.clear();
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data: questions });
});

afterEach(() => {
  jest.useRealTimers();
});

test('loads the question bank from the home page', async () => {
  await act(async () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByRole('heading', { name: /ai là triệu phú/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('link', { name: 'Ngân hàng câu hỏi' }));

  expect(await screen.findByText('Có 15 câu hỏi')).toBeInTheDocument();
  expect(axios.get).toHaveBeenCalledWith('/data/questions.json', expect.objectContaining({
    signal: expect.any(AbortSignal),
  }));
});

test('shows the correct answer on a question detail route', async () => {
  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={['/questions/3']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(await screen.findByText('Đáp án đúng')).toBeInTheDocument();
  expect(screen.getByText('<ol>')).toBeInTheDocument();
});

test('locks and reveals answers, advances the game, and records the result', async () => {
  jest.useFakeTimers();

  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  fireEvent.change(screen.getByLabelText('Tên người chơi'), {
    target: { value: 'An' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
  expect(screen.getByText('Câu 1/15')).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'b' });
  const firstAnswer = screen.getByRole('button', { name: /Đáp án B/ });
  expect(firstAnswer).toHaveClass('answer-button--selected');

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(firstAnswer).toHaveClass('answer-button--correct');

  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(screen.getByText('Câu 2/15')).toBeInTheDocument();
  expect(screen.getByText('Còn 30 giây')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Đáp án A/ }));
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(screen.getByRole('button', { name: /Đáp án A/ })).toHaveClass('answer-button--incorrect');
  expect(screen.getByRole('button', { name: /Đáp án C/ })).toHaveClass('answer-button--correct');

  act(() => {
    jest.advanceTimersByTime(2000);
  });
  expect(screen.getByRole('heading', { name: 'Rất tiếc, bạn đã trả lời sai' })).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem('ltw_trieuphu_history'))[0]).toEqual(
    expect.objectContaining({ name: 'An', correctCount: 1, prize: 0 }),
  );
});

test('uses 50:50 and audience help, answers by keyboard, and quits with the current prize', async () => {
  jest.useFakeTimers();

  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  fireEvent.change(screen.getByLabelText('Tên người chơi'), {
    target: { value: 'An' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));
  fireEvent.click(screen.getByRole('button', { name: /^50:50/ }));

  expect(screen.getAllByRole('button', { name: /đã bị loại/ })).toHaveLength(2);
  expect(screen.getByRole('button', { name: /50:50 · Đã dùng/ })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /Hỏi khán giả/ }));
  const audienceVotes = screen.getAllByRole('img').map((bar) => (
    Number(bar.getAttribute('aria-label').match(/(\d+)%/)[1])
  ));
  expect(audienceVotes.reduce((total, percentage) => total + percentage, 0)).toBe(100);
  expect(audienceVotes[1]).toBe(Math.max(...audienceVotes));
  const hiddenVotes = screen.getAllByRole('button', { name: /đã bị loại/ }).map((button) => {
    const [, letter] = button.getAttribute('aria-label').match(/Đáp án ([A-D])/);
    return audienceVotes['ABCD'.indexOf(letter)];
  });
  expect(hiddenVotes).toEqual([0, 0]);
  expect(screen.getByRole('button', { name: /Hỏi khán giả · Đã dùng/ })).toBeDisabled();

  fireEvent.keyDown(window, { key: 'B' });
  expect(screen.getByRole('button', { name: /Đáp án B/ })).toHaveClass(
    'answer-button--selected',
  );
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(screen.getByText('Câu 2/15')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Khán giả bình chọn' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /50:50 · Đã dùng/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: /Hỏi khán giả · Đã dùng/ })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: 'Dừng cuộc chơi' }));

  expect(screen.getByRole('heading', { name: 'Bạn đã dừng cuộc chơi' })).toBeInTheDocument();
  expect(screen.getAllByText('200.000 đ')).toHaveLength(2);
  expect(JSON.parse(window.localStorage.getItem('ltw_trieuphu_history'))[0]).toEqual(
    expect.objectContaining({ name: 'An', correctCount: 1, prize: 200000 }),
  );
});

test('ends the game when the timer expires and records the timeout result', async () => {
  jest.useFakeTimers();

  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  fireEvent.change(screen.getByLabelText('Tên người chơi'), {
    target: { value: 'An' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));

  act(() => {
    jest.advanceTimersByTime(30000);
  });
  expect(screen.getByText('Còn 0 giây')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(screen.getByRole('heading', { name: 'Hết giờ!' })).toBeInTheDocument();
  expect(JSON.parse(window.localStorage.getItem('ltw_trieuphu_history'))[0]).toEqual(
    expect.objectContaining({ name: 'An', correctCount: 0, prize: 0 }),
  );
});

test('shows question history in prize order and clears persisted records', async () => {
  window.localStorage.setItem('ltw_trieuphu_history', JSON.stringify([
    {
      id: 'low',
      name: 'Bình',
      correctCount: 6,
      prize: 2000000,
      playedAt: '29/10/2026, 08:00:00',
    },
    {
      id: 'high',
      name: 'An',
      correctCount: 11,
      prize: 22000000,
      playedAt: '29/10/2026, 09:00:00',
    },
  ]));

  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={['/history']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  const playerRows = screen.getAllByRole('row').slice(1);
  expect(playerRows[0]).toHaveTextContent('An');
  expect(playerRows[1]).toHaveTextContent('Bình');
  expect(screen.getByText('2', { selector: 'strong' })).toBeInTheDocument();
  expect(screen.getByText('24.000.000 đ', { selector: 'strong' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Xóa lịch sử' }));

  expect(screen.getByText('Chưa có lượt chơi nào.')).toBeInTheDocument();
  expect(window.localStorage.getItem('ltw_trieuphu_history')).toBe('[]');
});

test('shows the 404 page for an unknown route', async () => {
  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={['/unknown']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/');
});
