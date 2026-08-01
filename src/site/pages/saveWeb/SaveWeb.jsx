import { useState, useEffect } from "react";
import usePageMeta from "../../../utils/usePageMeta";
import "./SaveWeb.css";

const SaveWeb = () => {
  usePageMeta({
    title: "Save Web Page",
    description: "Bookmark manager to save web pages with title, URL and notes.",
  });
  const [bookmarks, setBookmarks] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
  });
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load bookmarks from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("savedWebPages");
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage
  const saveToLocalStorage = (updatedBookmarks) => {
    localStorage.setItem("savedWebPages", JSON.stringify(updatedBookmarks));
    setBookmarks(updatedBookmarks);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    // Validate inputs
    if (!formData.title.trim()) {
      setStatus("❌ Please enter a title");
      return;
    }
    if (!formData.url.trim()) {
      setStatus("❌ Please enter a URL");
      return;
    }
    if (!validateUrl(formData.url)) {
      setStatus("❌ Invalid URL format. Please include http:// or https://");
      return;
    }

    const newBookmark = {
      id: editingId || Date.now(),
      title: formData.title.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
      createdAt: editingId
        ? bookmarks.find((b) => b.id === editingId).createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedBookmarks;
    if (editingId) {
      updatedBookmarks = bookmarks.map((b) =>
        b.id === editingId ? newBookmark : b,
      );
      setStatus("✅ Bookmark updated successfully!");
      setEditingId(null);
    } else {
      updatedBookmarks = [newBookmark, ...bookmarks];
      setStatus("✅ Bookmark saved successfully!");
    }

    saveToLocalStorage(updatedBookmarks);
    setFormData({ title: "", url: "", description: "" });

    // Clear status after 3 seconds
    setTimeout(() => setStatus(""), 3000);
  };

  const handleEdit = (bookmark) => {
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
    });
    setEditingId(bookmark.id);
    setStatus("");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      const updatedBookmarks = bookmarks.filter((b) => b.id !== id);
      saveToLocalStorage(updatedBookmarks);
      setStatus("✅ Bookmark deleted successfully!");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", url: "", description: "" });
    setStatus("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.target.name !== "description") {
      e.preventDefault();
      handleSave();
    }
  };

  // Filter bookmarks based on search term
  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="save-web-page">
      <div className="page-container">
        <div className="glass-header centered">
          <h1 className="page-title">Save Web Page</h1>
          <p className="page-subtitle">
            Bookmark your favorite web pages with title, URL and description
          </p>
        </div>

        <div className="glass-content">
          <div className="save-web-wrapper">
            {/* Add/Edit Form */}
            <div className="bookmark-form">
              <h3>
                {editingId ? (
                  <>
                    <i className="fas fa-edit"></i> Edit Bookmark
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus-circle"></i> Add New Bookmark
                  </>
                )}
              </h3>

              <div className="form-group">
                <label htmlFor="title">
                  Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter page title"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="url">
                  URL <span className="required">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  className="form-input"
                  value={formData.url}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Short description or note"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button onClick={handleSave} className="btn-save">
                  <span>{editingId ? "Update Bookmark" : "Save Bookmark"}</span>
                </button>
                {editingId && (
                  <button onClick={handleCancelEdit} className="btn-cancel">
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {status && (
                <div
                  className={`status-message ${
                    status.includes("❌")
                      ? "error"
                      : status.includes("✅")
                        ? "success"
                        : "info"
                  }`}
                >
                  {status}
                </div>
              )}
            </div>

            {/* Bookmarks List */}
            {bookmarks.length > 0 && (
              <div className="bookmarks-section">
                <div className="section-header">
                  <h3>
                    <i className="fas fa-bookmark"></i> Saved Bookmarks (
                    {filteredBookmarks.length})
                  </h3>
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search bookmarks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bookmarks-list">
                  {filteredBookmarks.length > 0 ? (
                    filteredBookmarks.map((bookmark) => (
                      <div key={bookmark.id} className="bookmark-card">
                        <div className="bookmark-content">
                          <h4 className="bookmark-title">
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {bookmark.title}
                            </a>
                          </h4>
                          <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bookmark-url"
                          >
                            <i className="fas fa-link"></i> {bookmark.url}
                          </a>
                          {bookmark.description && (
                            <p className="bookmark-description">
                              {bookmark.description}
                            </p>
                          )}
                          <div className="bookmark-meta">
                            <span>
                              <i className="fas fa-clock"></i>{" "}
                              {formatDate(bookmark.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="bookmark-actions">
                          <button
                            onClick={() => handleEdit(bookmark)}
                            className="btn-edit"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(bookmark.id)}
                            className="btn-delete"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      <i className="fas fa-search"></i>
                      <p>No bookmarks found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {bookmarks.length === 0 && (
              <div className="empty-state">
                <i className="fas fa-bookmark"></i>
                <h3>No bookmarks yet</h3>
                <p>
                  Start saving your favorite web pages by filling the form
                  above!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveWeb;
