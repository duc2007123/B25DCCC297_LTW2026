import StudentItem from './StudentItem'

const StudentTable = ({ students, handleDelete }) => {
  if (students.length === 0) {
    return <p>Không có sinh viên nào.</p>
  }

  return (
    <ul>
      {students.map((student) => (
        <StudentItem
          key={student.id}
          student={student}
          handleDelete={handleDelete}
        />
      ))}
    </ul>
  )
}

export default StudentTable