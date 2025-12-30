import React, { useState, useEffect, useRef } from "react";
import "./Notes.css";

// Modern Rich Text Editor Component
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  height = 200,
  toolbar = "basic",
}) => {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState({});

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      updateActiveStates();
    }
  };

  const updateActiveStates = () => {
    const activeStates = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    };
    setIsActive(activeStates);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateActiveStates();
    handleInput();
  };

  const handleKeyDown = (e) => {
    // Handle Enter key for better line breaks
    if (e.key === "Enter") {
      document.execCommand("insertHTML", false, "<br><br>");
      e.preventDefault();
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    const url = prompt("Enter URL:", "https://");

    if (url && url !== "https://") {
      if (selectedText) {
        document.execCommand("createLink", false, url);
      } else {
        const linkText = prompt("Enter link text:", url);
        if (linkText) {
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${url}" target="_blank">${linkText}</a>`
          );
        }
      }
      editorRef.current.focus();
      handleInput();
    }
  };

  const ToolbarButton = ({ command, icon, title, onClick, value }) => (
    <button
      type="button"
      className={`toolbar-btn ${isActive[command] ? "active" : ""}`}
      onClick={onClick || (() => execCommand(command, value))}
      title={title}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
    >
      {icon}
    </button>
  );

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <ToolbarButton command="bold" icon={<strong>B</strong>} title="Bold" />
        <ToolbarButton command="italic" icon={<em>I</em>} title="Italic" />
        <ToolbarButton command="underline" icon={<u>U</u>} title="Underline" />

        <span className="toolbar-separator">|</span>

        <ToolbarButton command="justifyLeft" icon="◀" title="Align Left" />
        <ToolbarButton command="justifyCenter" icon="▬" title="Align Center" />
        <ToolbarButton command="justifyRight" icon="▶" title="Align Right" />

        <span className="toolbar-separator">|</span>

        <ToolbarButton
          command="insertUnorderedList"
          icon="•"
          title="Bullet List"
        />
        <ToolbarButton
          command="insertOrderedList"
          icon="1."
          title="Numbered List"
        />
        <ToolbarButton
          command=""
          icon="🔗"
          title="Insert Link"
          onClick={insertLink}
        />

        {toolbar === "full" && (
          <>
            <span className="toolbar-separator">|</span>
            <ToolbarButton
              command="formatBlock"
              icon="H1"
              title="Heading 1"
              value="<h2>"
            />
            <ToolbarButton
              command="formatBlock"
              icon="H2"
              title="Heading 2"
              value="<h3>"
            />
            <ToolbarButton
              command="removeFormat"
              icon="✕"
              title="Clear Formatting"
            />
            <ToolbarButton
              command="insertHorizontalRule"
              icon="—"
              title="Horizontal Line"
            />
          </>
        )}
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        style={{ minHeight: height }}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseUp={updateActiveStates}
        onKeyUp={updateActiveStates}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    shortContent: "",
    content: "",
    createdAt: "",
    updatedAt: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Load notes from localStorage on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    try {
      const savedNotes = localStorage.getItem("userNotes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const saveNotesToStorage = (notesToSave) => {
    try {
      localStorage.setItem("userNotes", JSON.stringify(notesToSave));
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a title!");
      return;
    }

    const now = new Date().toISOString();

    if (editingNote) {
      // Update existing note
      const updatedNotes = notes.map((note) =>
        note.id === editingNote.id
          ? {
              ...formData,
              id: editingNote.id,
              createdAt: editingNote.createdAt,
              updatedAt: now,
            }
          : note
      );
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    } else {
      // Create new note
      const newNote = {
        ...formData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      shortContent: "",
      content: "",
      createdAt: "",
      updatedAt: "",
    });
    setEditingNote(null);
    setShowForm(false);
    setViewingNote(null);
  };

  const handleView = (note) => {
    setViewingNote(note);
  };

  const handleEdit = (note) => {
    setFormData({
      id: note.id,
      title: note.title,
      shortContent: note.shortContent || "",
      content: note.content || "",
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
    setEditingNote(note);
    setShowForm(true);
  };

  const handleDelete = (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.shortContent &&
        note.shortContent.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (note.content &&
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notes-page">
      <div className="page-container">
        <div className="glass-header spaced">
          <h1 className="page-title">My Notes</h1>
          <div className="header-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={() => setShowForm(true)} className="btn-add-note">
              ➕ Add Note
            </button>
          </div>
        </div>

        {/* Note Form Modal */}
        {showForm && (
          <div
            className="modal-overlay"
            onClick={() => !editingNote && resetForm()}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingNote ? "Edit Note" : "Create New Note"}</h2>
                <button onClick={resetForm} className="btn-close">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="note-form">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter note title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shortContent">Description</label>
                  <RichTextEditor
                    value={formData.shortContent}
                    onChange={(content) =>
                      setFormData((prev) => ({
                        ...prev,
                        shortContent: content,
                      }))
                    }
                    placeholder="Brief description of the note..."
                    height={100}
                    toolbar="basic"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, content: content }))
                    }
                    placeholder="Enter your note content here..."
                    height={300}
                    toolbar="full"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    {editingNote ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Note Modal */}
        {viewingNote && (
          <div className="modal-overlay" onClick={() => setViewingNote(null)}>
            <div
              className="modal-content view-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>View Note</h2>
                <button
                  onClick={() => setViewingNote(null)}
                  className="btn-close"
                >
                  ✕
                </button>
              </div>

              <div className="view-content">
                <div className="view-section">
                  <h3 className="view-title">{viewingNote.title}</h3>
                </div>

                {viewingNote.shortContent && (
                  <div className="view-section">
                    <h4 className="view-label">Description</h4>
                    <div
                      className="view-description rich-text-content"
                      dangerouslySetInnerHTML={{
                        __html: viewingNote.shortContent,
                      }}
                    />
                  </div>
                )}

                {viewingNote.content && (
                  <div className="view-section">
                    <h4 className="view-label">Content</h4>
                    <div
                      className="view-text rich-text-content"
                      dangerouslySetInnerHTML={{
                        __html: viewingNote.content,
                      }}
                    />
                  </div>
                )}

                <div className="view-meta">
                  <div className="meta-item">
                    <strong>Created:</strong>{" "}
                    {formatDate(viewingNote.createdAt)}
                  </div>
                  {viewingNote.updatedAt !== viewingNote.createdAt && (
                    <div className="meta-item">
                      <strong>Updated:</strong>{" "}
                      {formatDate(viewingNote.updatedAt)}
                    </div>
                  )}
                </div>

                <div className="view-actions">
                  <button
                    onClick={() => {
                      setViewingNote(null);
                      handleEdit(viewingNote);
                    }}
                    className="btn-edit-from-view"
                  >
                    Edit This Note
                  </button>
                  <button
                    onClick={() => setViewingNote(null)}
                    className="btn-close-view"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="glass-content">
          <div className="notes-stats">
            <p>
              Total: <strong>{notes.length}</strong> notes | Showing:{" "}
              <strong>{filteredNotes.length}</strong>
            </p>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <div>
                  <h3>No notes found</h3>
                  <p>No notes match the search term "{searchTerm}"</p>
                </div>
              ) : (
                <div>
                  <h3>No notes yet</h3>
                  <p>Create your first note to get started!</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-add-note"
                  >
                    ➕ Create First Note
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => {
                return (
                  <div key={note.id} className="note-card">
                    {/* Title - Clickable */}
                    <div
                      className="note-header clickable"
                      onClick={() => handleView(note)}
                    >
                      <h3 className="note-title">{note.title}</h3>
                    </div>

                    {/* Short Description - Always visible */}
                    {note.shortContent && (
                      <div
                        className="note-short-content rich-text-content"
                        dangerouslySetInnerHTML={{
                          __html:
                            note.shortContent.length > 100
                              ? note.shortContent.substring(0, 100) + "..."
                              : note.shortContent,
                        }}
                      />
                    )}

                    {/* Full Content - Show preview */}
                    {note.content && (
                      <div className="note-content collapsed">
                        <div
                          className="rich-text-content"
                          dangerouslySetInnerHTML={{
                            __html:
                              note.content.length > 150
                                ? `${note.content.substring(0, 150)}...`
                                : note.content,
                          }}
                        />
                      </div>
                    )}

                    {/* Meta Information */}
                    <div className="note-meta">
                      <small>
                        Created: {formatDate(note.createdAt)}
                        {note.updatedAt !== note.createdAt && (
                          <> | Updated: {formatDate(note.updatedAt)}</>
                        )}
                      </small>
                    </div>

                    {/* Action Buttons - Moved to bottom */}
                    <div className="note-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(note);
                        }}
                        className="btn-view"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(note);
                        }}
                        className="btn-edit"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                        className="btn-delete"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
