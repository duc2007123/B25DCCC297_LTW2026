import { act, render, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import questions from '../public/data/questions.json';

jest.mock('axios', () => ({
  get: jest.fn(),
  isCancel: jest.fn(() => false),
}));

beforeEach(() => {
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data: questions });
});

test('shows the question bank with the loaded question count', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/questions']}>
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByText('Có 15 câu hỏi')).toBeInTheDocument();
});

test('shows the correct answer on a question detail route', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/questions/3']}>
        <App />
      </MemoryRouter>,
    );
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByText('Đáp án đúng')).toBeInTheDocument();
});
