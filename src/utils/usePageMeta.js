import { useEffect } from "react";

const SITE_NAME = "Zymuk Trần";
const DEFAULT_TITLE = `${SITE_NAME} - QA Engineer Portfolio`;
const DEFAULT_DESCRIPTION =
  "Zymuk Trần - QA Engineer portfolio. Software testing experience, projects, and free online tools (calculator, notes, text encoder/decoder, encrypt/decrypt, JSON formatter, image editor, reminders, numerology).";
const DEFAULT_KEYWORDS =
  "Zymuk, Zymuk Trần, QA Engineer, QA Portfolio, Software Tester, Test Engineer, Manual Testing, Automated Testing, Automotive Testing, Software Quality Assurance, Portfolio, Free Online Tools, Vietnam, Vietnamese QA, Kiểm thử phần mềm, Kỹ sư QA";

const setMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const setOgTag = (property, content) => {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const usePageMeta = ({ title, description, keywords }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${SITE_NAME}` : DEFAULT_TITLE;
    document.title = fullTitle;
    setOgTag("og:title", fullTitle);
    setOgTag("twitter:title", fullTitle);

    const finalDescription = description || DEFAULT_DESCRIPTION;
    setMetaTag("description", finalDescription);
    setOgTag("og:description", finalDescription);
    setMetaTag("twitter:description", finalDescription);

    const finalKeywords = keywords
      ? `${keywords}, ${DEFAULT_KEYWORDS}`
      : DEFAULT_KEYWORDS;
    setMetaTag("keywords", finalKeywords);
  }, [title, description, keywords]);
};

export default usePageMeta;
