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
