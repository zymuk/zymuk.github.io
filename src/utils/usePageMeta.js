import { useEffect } from "react";

const SITE_NAME = "Zymuk Trần";

const setMeta = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const usePageMeta = ({ title, description }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - QA Engineer Portfolio`;
    document.title = fullTitle;

    if (description) {
      setMeta("description", description);
      setMeta("og:description", description);
      setMeta("twitter:description", description);
    }
  }, [title, description]);
};

export default usePageMeta;
