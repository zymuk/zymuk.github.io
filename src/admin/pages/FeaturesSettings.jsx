import React, { useState, useEffect } from "react";
import "./FeaturesSettings.css";

const FeaturesSettings = () => {
	const [features, setFeatures] = useState([
		{ id: "calculator", displayName: "Calculator", description: "", isVisible: true },
		{ id: "notes", displayName: "Notes", description: "", isVisible: true },
		{ id: "save_web", displayName: "Save Web Page", description: "", isVisible: false },
		{ id: "phone_fengshui", displayName: "Phone Feng Shui Score", description: "", isVisible: true },
		{ id: "money_fengshui", displayName: "Money Serial Feng Shui Score", description: "", isVisible: false },
	]);

	useEffect(() => {
		const savedFeatures = localStorage.getItem("featuresSettings");
		if (savedFeatures) {
			setFeatures(JSON.parse(savedFeatures));
		}
	}, []);

	const handleChange = (index, field, value) => {
		const updatedFeatures = [...features];
		updatedFeatures[index][field] = value;
		setFeatures(updatedFeatures);
	};

	const handleSave = () => {
		const updatedFeatures = features.map((feature) => ({
			id: feature.id,
			displayName: feature.displayName,
			description: feature.description,
			visible: feature.visible,
		}));

		localStorage.setItem("featuresSettings", JSON.stringify(updatedFeatures));

		alert("Features settings have been saved!");
	};

	return (
		<div className="admin-features">
			<h2>Features Settings</h2>
			<table className="features-table">
				<thead>
					<tr>
						<th>Feature ID</th>
						<th>Display Name</th>
						<th>Description</th>
						<th>Visible</th>
					</tr>
				</thead>
				<tbody>
					{features.map((feature, index) => (
						<tr key={feature.id}>
							<td>{feature.id}</td>
							<td>
								<input
									type="text"
									value={feature.displayName}
									onChange={(e) => handleChange(index, "displayName", e.target.value)}
								/>
							</td>
							<td>
								<input
									type="text"
									value={feature.description}
									onChange={(e) => handleChange(index, "description", e.target.value)}
								/>
							</td>
							<td>
								<input
									type="checkbox"
									checked={feature.isVisible}
									onChange={(e) => handleChange(index, "isVisible", e.target.checked)}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="features-save-btn">
				<button onClick={handleSave}>
					<i className="fas fa-save"></i> Save Changes
				</button>
			</div>

		</div>
	);
};

export default FeaturesSettings;