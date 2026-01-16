import React, { useState, useEffect } from "react";
import "./AdminCommon.css";
import "./SkillsSettings.css";

const SkillsSettings = () => {
  const [t, setT] = useState({});
  const lang = localStorage.getItem("lang") || "en";
  const [skills, setSkills] = useState([]);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  useEffect(() => {
    fetch(`/${lang}.json`)
      .then((res) => res.json())
      .then((data) => setT(data))
      .catch((error) => console.error("Error loading translations:", error));
  }, [lang]);

  useEffect(() => {
    const storedSkills = localStorage.getItem("skills");
    if (storedSkills) {
      setSkills(JSON.parse(storedSkills));
    } else {
      fetch("/data.json")
        .then((res) => res.json())
        .then((data) => {
          if (data.skills) {
            setSkills(data.skills);
          }
        })
        .catch((error) => console.error("Error loading skills:", error));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("skills", JSON.stringify(skills));
    alert(t.save || "Skills saved successfully! ✅");
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index][field] = value;
    setSkills(updatedSkills);
  };

  const handleItemChange = (categoryIndex, itemIndex, field, value) => {
    const updatedSkills = [...skills];
    if (field === "level") {
      value = Math.min(100, Math.max(0, parseInt(value) || 0));
    }
    updatedSkills[categoryIndex].items[itemIndex][field] = value;
    setSkills(updatedSkills);
  };

  const addCategory = () => {
    const newCategory = {
      category: "",
      items: [],
      isVisible: true,
    };
    setSkills([...skills, newCategory]);
    setEditingCategoryIndex(skills.length);
  };

  const removeCategory = (index) => {
    if (
      window.confirm(
        t.confirm_delete || "Are you sure you want to delete this category?"
      )
    ) {
      const updatedSkills = skills.filter((_, i) => i !== index);
      setSkills(updatedSkills);
    }
  };

  const addItem = (categoryIndex) => {
    const newItem = {
      name: "",
      years: 1,
      isVisible: true,
    };
    const updatedSkills = [...skills];
    updatedSkills[categoryIndex].items = [
      ...updatedSkills[categoryIndex].items,
      newItem,
    ];
    setSkills(updatedSkills);
    setEditingCategoryIndex(categoryIndex);
    setEditingItemIndex(updatedSkills[categoryIndex].items.length - 1);
  };

  const removeItem = (categoryIndex, itemIndex) => {
    if (
      window.confirm(
        t.confirm_delete || "Are you sure you want to delete this skill?"
      )
    ) {
      const updatedSkills = [...skills];
      updatedSkills[categoryIndex].items = updatedSkills[
        categoryIndex
      ].items.filter((_, i) => i !== itemIndex);
      setSkills(updatedSkills);
    }
  };

  return (
    <div className="admin-page">
      <h2>{t.skills_settings || "Skills Settings"}</h2>

      <div className="admin-buttons">
        <button onClick={addCategory} className="admin-btn admin-btn-primary">
          <i className="fas fa-plus"></i> {t.add_category || "Add Category"}
        </button>
        <button onClick={handleSave} className="admin-btn admin-btn-success">
          <i className="fas fa-save"></i> {t.save || "Save"}
        </button>
      </div>

      <div className="skills-categories-list">
        {skills.map((category, catIndex) => (
          <div key={catIndex} className="skill-category-item">
            <div className="category-header">
              <div className="category-info">
                <input
                  type="text"
                  value={category.category}
                  onChange={(e) =>
                    handleCategoryChange(catIndex, "category", e.target.value)
                  }
                  placeholder={t.category_name || "Category Name"}
                  className="category-name-input"
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={category.isVisible !== false}
                    onChange={(e) =>
                      handleCategoryChange(
                        catIndex,
                        "isVisible",
                        e.target.checked
                      )
                    }
                  />
                  {t.visible || "Visible"}
                </label>
              </div>
              <div className="category-actions">
                <button
                  onClick={() => addItem(catIndex)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                >
                  <i className="fas fa-plus"></i> {t.add_skill || "Add Skill"}
                </button>
                <button
                  onClick={() => removeCategory(catIndex)}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                >
                  <i className="fas fa-trash"></i> {t.delete || "Delete"}
                </button>
              </div>
            </div>

            <div className="skills-items-list">
              {category.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="skill-item-row">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(
                        catIndex,
                        itemIndex,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder={t.skill_name || "Skill Name"}
                    className="skill-name-input"
                  />
                  <input
                    type="number"
                    value={item.years}
                    onChange={(e) =>
                      handleItemChange(
                        catIndex,
                        itemIndex,
                        "years",
                        e.target.value
                      )
                    }
                    min="0"
                    max="20"
                    className="skill-level-input"
                  />
                  <span className="level-label">years</span>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={item.isVisible !== false}
                      onChange={(e) =>
                        handleItemChange(
                          catIndex,
                          itemIndex,
                          "isVisible",
                          e.target.checked
                        )
                      }
                    />
                    {t.visible || "Visible"}
                  </label>
                  <button
                    onClick={() => removeItem(catIndex, itemIndex)}
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    title={t.delete || "Delete"}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              {(!category.items || category.items.length === 0) && (
                <p className="no-items">
                  {t.no_skills || "No skills added yet"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsSettings;
