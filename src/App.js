import { useTheme } from './context/ThemeContext';
import LeagueDashboard from './LeagueDashboard';

const BUILD_TAG = "bd-5918";

export default function App() {
  const { theme } = useTheme();
  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
      <LeagueDashboard />
    </div>
  );
}
