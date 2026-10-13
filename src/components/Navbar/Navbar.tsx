import React, { FC, useEffect, useState } from "react";
import { Menu, X } from "react-feather";
import { Link, useLocation } from "react-router-dom";

import transparentLogo from "../../assets/transparent-logo.svg";

import styles from "./Navbar.module.css";

const navigationItems = [
  { label: "Features", href: "/#features" },
  { label: "Templates", href: "/#templates" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy", href: "/#privacy" },
];

const Navbar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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

  return (
    <header className={styles.header}>
      <nav className={styles.navbar} aria-label="Main navigation">
        <Link className={styles.brand} to="/" aria-label="ResumeCraft home">
          <img src={transparentLogo} alt="ResumeCraft" />
        </Link>

        <div className={styles.desktopNavigation}>
          <div className={styles.navigationLinks}>
            {navigationItems.map((item) => (
              <a key={item.label} href={item.href}>
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

          <Link className={styles.primaryAction} to="/start">
            Build my resume
          </Link>
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
            <a key={item.label} href={item.href} tabIndex={isMenuOpen ? 0 : -1}>
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
          <Link
            className={styles.mobilePrimaryAction}
            to="/start"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Build my resume
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
