export default function Api() {
  const listA = [
    { key: "calculator", name: "Calculator", isVisible: 1 },
    { key: "notes", name: "Notes", isVisible: 1 },
    { key: "save_web", name: "Save Web Page", isVisible: 0 },
  ];
  return JSON.stringify(listA);
}
