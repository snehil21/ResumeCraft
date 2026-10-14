import React, { FC, useEffect, useState } from "react";
import { Menu, X } from "react-feather";
import { Link, useLocation } from "react-router-dom";

import transparentLogo from "../../assets/transparent-logo.svg";
import { useResumeStore } from "../../store";
import { isResumeDocumentEmpty } from "../../utils/resumeDocument";

import styles from "./Navbar.module.css";

const navigationItems = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#templates" },
  { label: "Privacy", href: "/#privacy" },
];

const Navbar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const resumeDocument = useResumeStore((state) => state.document);
  const isStartPage = location.pathname === "/start";
  const hasCurrentDraft = !isResumeDocumentEmpty(resumeDocument);
  const showPrimaryAction = !isStartPage || hasCurrentDraft;
  const primaryActionTo = isStartPage ? "/resumebuilder" : "/start?mode=create";
  const primaryActionLabel = isStartPage ? "Open current draft" : "Build my resume";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return undefined;
    }

    const sectionIds = navigationItems.map((item) => item.href.split("#")[1]);
    const updateActiveSection = () => {
      if (window.scrollY < 160) {
        setActiveSection("");
        return;
      }

      const marker = 150;
      const visibleSection = sectionIds.reduce((current, id) => {
        const section = document.getElementById(id);
        return section && section.getBoundingClientRect().top <= marker ? id : current;
      }, "");
      setActiveSection(visibleSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [location.pathname]);

  const scrollHomeToTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Main navigation">
        <Link className={styles.brand} to="/" aria-label="ResumeCraft home" onClick={scrollHomeToTop}>
          <img src={transparentLogo} alt="ResumeCraft" />
        </Link>

        <div className={styles.desktopNavigation}>
          <div className={styles.navigationLinks}>
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={activeSection === item.href.split("#")[1] ? styles.activeNavigationLink : ""}
                aria-current={activeSection === item.href.split("#")[1] ? "location" : undefined}
              >
                {item.label}
              </a>
            ))}
            <a
              href="https://github.com/snehil21/ResumeCraft"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>

          {showPrimaryAction ? (
            <Link className={styles.primaryAction} to={primaryActionTo}>
              {primaryActionLabel}
            </Link>
          ) : null}
        </div>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <div
          className={`${styles.mobileNavigation} ${
            isMenuOpen ? styles.mobileNavigationOpen : ""
          }`}
          id="mobile-navigation"
          aria-hidden={!isMenuOpen}
        >
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              tabIndex={isMenuOpen ? 0 : -1}
              aria-current={activeSection === item.href.split("#")[1] ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
          <a
            href="https://github.com/snehil21/ResumeCraft"
            target="_blank"
            rel="noreferrer"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            GitHub
          </a>
          {showPrimaryAction ? (
            <Link
              className={styles.mobilePrimaryAction}
              to={primaryActionTo}
              tabIndex={isMenuOpen ? 0 : -1}
            >
              {primaryActionLabel}
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
