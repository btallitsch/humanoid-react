import React from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal = ({ open, onClose, children }: ModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50">
      <div className="bg-white p-4 m-10 rounded">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
