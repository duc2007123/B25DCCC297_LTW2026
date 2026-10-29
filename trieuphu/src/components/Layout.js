import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

const Layout = ({ buildTag }) => (
  <div className="app-shell" data-build-tag={buildTag}>
    <NavBar />
    <main className="page-container">
      <Outlet />
    </main>
    <footer className="site-footer">Ai là triệu phú · Lập trình Web</footer>
  </div>
);

export default Layout;
