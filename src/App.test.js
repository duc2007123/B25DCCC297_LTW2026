import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';
import { setMatches } from './store/matchesSlice';
import { ThemeProvider } from './context/ThemeContext';
import { NoticeProvider } from './context/NoticeContext';
import sampleMatches from '../public/data/matches.json';

const renderApp = () =>
  render(
    <Provider store={store}>
      <ThemeProvider>
        <NoticeProvider>
          <App />
        </NoticeProvider>
      </ThemeProvider>
    </Provider>
  );

beforeEach(() => {
  window.localStorage.clear();
  store.dispatch(setMatches([]));
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(sampleMatches),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders the league dashboard and standings from the sample data', async () => {
  renderApp();

  expect(screen.getByRole('heading', { name: 'Giải bóng đá khoa' })).toBeInTheDocument();
  expect(await screen.findByText('Tìm thấy 9 trận')).toBeInTheDocument();
  const teamRows = await screen.findAllByRole('row', { name: /Khoa CNTT/ });
  expect(within(teamRows[0]).getByText('7')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Các trận đấu' })).toBeInTheDocument();
  expect(screen.getByText(/Cần thêm 3 điểm ở 2 trận còn lại/)).toBeInTheDocument();
  expect(global.fetch.mock.calls[0][0]).toBe('/data/matches.json');
});

test('shows an error when the sample data cannot be fetched', async () => {
  global.fetch.mockRejectedValueOnce(new Error('Network error'));

  renderApp();

  expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được lịch thi đấu');
  expect(await screen.findByText('Bảng xếp hạng')).toBeInTheDocument();
});

test('filters matches and supports adding, editing, and deleting a fixture', async () => {
  renderApp();

  expect(await screen.findByText('Tìm thấy 9 trận')).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Lọc theo vòng' }), '1');
  expect(screen.getByText('Tìm thấy 3 trận')).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Lọc theo đội' }), '1');
  expect(screen.getByText('Tìm thấy 1 trận')).toBeInTheDocument();
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Lọc theo vòng' }), 'all');
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Lọc theo đội' }), 'all');

  await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm đội' }), 'Marketing');
  expect(await screen.findByText('Tìm thấy 3 trận')).toBeInTheDocument();
  await userEvent.clear(screen.getByRole('searchbox', { name: 'Tìm đội' }));
  expect(await screen.findByText('Tìm thấy 9 trận')).toBeInTheDocument();

  await userEvent.selectOptions(screen.getByLabelText('Đội khách'), '1');
  await userEvent.click(screen.getByRole('button', { name: /Thêm vào lịch/ }));
  expect(await screen.findByRole('alert')).toHaveTextContent('phải khác nhau');

  await userEvent.selectOptions(screen.getByLabelText('Đội nhà'), '4');
  await userEvent.selectOptions(screen.getByLabelText('Đội khách'), '5');
  await userEvent.type(screen.getByLabelText('Bàn đội nhà'), '2');
  await userEvent.type(screen.getByLabelText('Bàn đội khách'), '1');
  await userEvent.click(screen.getByRole('button', { name: /Thêm vào lịch/ }));
  expect(await screen.findByText('Tìm thấy 10 trận')).toBeInTheDocument();
  expect(screen.getByText(/Đã thêm trận/)).toBeInTheDocument();

  const homeInput = screen.getByRole('spinbutton', {
    name: 'Bàn thắng nhà Khoa CNTT - Khoa Marketing',
  });
  await userEvent.clear(homeInput);
  await userEvent.type(homeInput, '4');
  expect(homeInput).toHaveValue(4);

  const matchRow = homeInput.closest('tr');
  await userEvent.click(within(matchRow).getByRole('button', { name: 'Xóa' }));
  expect(await screen.findByText('Tìm thấy 9 trận')).toBeInTheDocument();
  expect(screen.getByText(/Đã xóa trận/)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));
  expect(await screen.findByText('Tìm thấy 10 trận')).toBeInTheDocument();
});
