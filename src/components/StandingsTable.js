import { memo } from 'react';
import { formatDiff } from '../data';

export default memo(function StandingsTable({ standings }) {
  const exportCSV = () => {
    const headers = ['Hạng', 'Đội', 'Trận', 'Thắng', 'Hòa', 'Thua', 'BT', 'BB', 'HS', 'Phong độ', 'Điểm'];
    const rows = standings.map((team, index) => [
      index + 1,
      team.name,
      team.played,
      team.won,
      team.drawn,
      team.lost,
      team.gf,
      team.ga,
      team.diff,
      team.form || '-',
      team.points,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bang_xep_hang.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button className="secondary-button" onClick={exportCSV} type="button" style={{ marginBottom: '10px' }}>
        Xuất CSV
      </button>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Hạng</th>
            <th>Đội</th>
            <th>Trận</th>
            <th>Thắng</th>
            <th>Hòa</th>
            <th>Thua</th>
            <th>BT</th>
            <th>BB</th>
            <th>HS</th>
            <th>Phong độ</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr key={team.id} style={index === standings.length - 1 ? { color: '#c62828' } : {}}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.gf}</td>
              <td>{team.ga}</td>
              <td>{formatDiff(team.diff)}</td>
              <td>{team.form || '-'}</td>
              <td><strong>{team.points}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});
