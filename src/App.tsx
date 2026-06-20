import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './screens/Home'
import CreateCharacter from './screens/CreateCharacter'
import Board from './screens/Board'
import Settings from './screens/Settings'

export default function App() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<CreateCharacter />} />
        <Route path="/c/:id" element={<Board />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
