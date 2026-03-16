import { useState, useEffect, useRef } from 'react'
import { saveNote, getAllNotes, deleteNote } from '../services/storage/field-notes-storage'
import content from '../../content/en.json'
import './FieldNotes.css'

function generateNoteId() {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export default function FieldNotes({ onClose }) {
  const [notes, setNotes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [composing, setComposing] = useState(false)
  const [draft, setDraft]       = useState('')
  const [saving, setSaving]     = useState(false)
  const textareaRef             = useRef(null)

  useEffect(() => {
    getAllNotes()
      .then(all => setNotes(all))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (composing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [composing])

  async function handleSave() {
    if (!draft.trim()) return
    setSaving(true)
    try {
      const note = {
        id:        generateNoteId(),
        timestamp: new Date().toISOString(),
        body:      draft.trim(),
      }
      await saveNote(note)
      setNotes(prev => [note, ...prev])
      setDraft('')
      setComposing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(content.fieldNotes.deleteConfirm)) return
    await deleteNote(id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  function handleKeyDown(e) {
    // Cmd/Ctrl+Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setComposing(false)
      setDraft('')
    }
  }

  return (
    <div className="field-notes">
      <div className="field-notes__header">
        <h2 className="field-notes__title">{content.fieldNotes.title}</h2>
        <div className="field-notes__header-actions">
          {!composing && (
            <button
              className="field-notes__new"
              onClick={() => setComposing(true)}
            >
              {content.fieldNotes.newNote}
            </button>
          )}
          <button
            className="field-notes__close"
            onClick={onClose}
            aria-label="Close field notes"
          >
            ×
          </button>
        </div>
      </div>

      {composing && (
        <div className="field-notes__compose">
          <textarea
            ref={textareaRef}
            className="field-notes__textarea"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={content.fieldNotes.placeholder}
            rows={6}
            aria-label={content.fieldNotes.placeholder}
          />
          <div className="field-notes__compose-actions">
            <button
              className="field-notes__save"
              onClick={handleSave}
              disabled={saving || !draft.trim()}
            >
              {saving ? '...' : content.fieldNotes.save}
            </button>
            <button
              className="field-notes__cancel"
              onClick={() => { setComposing(false); setDraft('') }}
            >
              {content.fieldNotes.cancel}
            </button>
            <span className="field-notes__hint">⌘↵ to save</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="field-notes__loading">...</div>
      ) : notes.length === 0 && !composing ? (
        <div className="field-notes__empty">{content.fieldNotes.empty}</div>
      ) : (
        <ol className="field-notes__list">
          {notes.map(note => {
            const d = new Date(note.timestamp)
            return (
              <li key={note.id} className="field-notes__item">
                <div className="field-notes__item-header">
                  <span className="field-notes__item-date">
                    {d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {' · '}
                    {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <button
                    className="field-notes__delete"
                    onClick={() => handleDelete(note.id)}
                    aria-label={content.fieldNotes.deleteAriaLabel}
                  >
                    ×
                  </button>
                </div>
                <p className="field-notes__body">{note.body}</p>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
