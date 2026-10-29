import { Link } from 'react-router-dom';

const NotFound = () => (
  <section className="content-panel not-found">
    <p className="eyebrow">404</p>
    <h1>Không tìm thấy trang</h1>
    <Link className="primary-button button-link" to="/">Về trang chủ</Link>
  </section>
);

export default NotFound;
