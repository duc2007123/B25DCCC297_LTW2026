const StudentItem = ({ student, handleDelete }) => {
  const { id, name, className, score } = student

  return (
    <li>
      {`${name} - Lớp: ${className} - Điểm: ${score} `}
      <button onClick={() => handleDelete(id, name)}>xóa</button>
    </li>
  )
}

export default StudentItem