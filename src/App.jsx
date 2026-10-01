import { useState } from 'react'
import StudentTable from './StudentTable'

const App = () => {
  const [students, setStudents] = useState([
    { id: 1, name: 'Nguyễn Văn An', className: 'D25CQCC03-B', score: 8.5 },
    { id: 2, name: 'Trần Thị Bích', className: 'D25CQCC01-B', score: 4.0 },
    { id: 3, name: 'Lê Văn Cường', className: 'D25CQCC02-B', score: 7.0 },
    { id: 4, name: 'Phạm Thị Dung', className: 'D25CQCC04-B', score: 9.0 }
  ])

  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('')
  const [newScore, setNewScore] = useState('')

  const [filter, setFilter] = useState('all')

  const addStudent = (event) => {
    event.preventDefault()

    if (!newName.trim() || !newClass.trim() || newScore === '') {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    const scoreNumber = parseFloat(newScore)
    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 10) {
      alert('Điểm số không hợp lệ! Vui lòng nhập điểm từ 0 đến 10.')
      return
    }

    const studentObject = {
      id: Date.now(),
      name: newName.trim(),
      className: newClass.trim(),
      score: scoreNumber
    }

    setStudents(students.concat(studentObject))
    setNewName('')
    setNewClass('')
    setNewScore('')
  }

  const handleDelete = (id, name) => {
    setStudents(students.filter((s) => s.id !== id))
    alert(`Đã xóa sinh viên ${name} thành công!`)
  }

  const studentsToShow = students.filter((s) => {
    if (filter === 'good') return s.score >= 8
    if (filter === 'failed') return s.score < 5
    return true
  })

  const totalStudents = students.length
  const averageScore = totalStudents > 0    ? (students.reduce((sum, s) => sum + s.score, 0) / totalStudents).toFixed(2) : 0

  return (
    <div className="container">
      <h2>Quản lý điểm sinh viên</h2>


      <div className="section">
        <strong>Thống kê: </strong>
        {`Tổng số: ${totalStudents} sinh viên | Điểm trung bình: ${averageScore}`}
      </div>

      <div className="section">
        <span>Lọc danh sách: </span>
        <button onClick={() => setFilter('all')}>Tất cả ({students.length})</button>{' '}
        <button onClick={() => setFilter('good')}>Sinh viên Giỏi (&ge; 8)</button>{' '}
        <button onClick={() => setFilter('failed')}>Sinh viên Trượt môn (&lt; 5)</button>
      </div>

      <h3>Thêm sinh viên mới</h3>
      <form onSubmit={addStudent}>
        <div className="form-row">
          <label>Họ và Tên: </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Lớp: </label>
          <input
            type="text"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>Điểm số (0 - 10): </label>
          <input
            type="number"
            step="0.1"
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
          />
        </div>

        <div className="form-row">
          <button type="submit">Thêm Sinh Viên</button>
        </div>
      </form>

      <h3>Danh sách sinh viên</h3>
      <StudentTable students={studentsToShow} handleDelete={handleDelete} />
    </div>
  )
}

export default App