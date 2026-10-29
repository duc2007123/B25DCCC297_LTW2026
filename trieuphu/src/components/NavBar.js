import { NavLink } from 'react-router-dom';

const NavBar = () => (
  <header className="site-header">
    <NavLink className="brand" to="/" end>
      <span className="brand-mark">?</span>
      <span>AI LÀ TRIỆU PHÚ</span>
    </NavLink>
    <nav className="main-nav" aria-label="Điều hướng chính">
      <NavLink to="/" end>Trang chủ</NavLink>
      <NavLink to="/questions">Ngân hàng câu hỏi</NavLink>
      <NavLink to="/history">Lịch sử</NavLink>
    </nav>
  </header>
);

export default NavBar;
