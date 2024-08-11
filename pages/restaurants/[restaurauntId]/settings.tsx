// pages/settings.tsx
import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/styles/Settings.module.css';

const Settings: React.FC = () => {
  // Example state for form fields
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [language, setLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save settings
    console.log({
      emailNotifications,
      smsNotifications,
      language,
      darkMode,
    });
    alert('Settings saved successfully!');
  };

  return (
    <Layout>
      <h1 className={styles.header}>Settings</h1>
      <form className={styles.form} onSubmit={handleSave}>
        
        {/* Notifications Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Notifications</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              Email Notifications
            </label>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={() => setSmsNotifications(!smsNotifications)}
              />
              SMS Notifications
            </label>
          </div>
        </div>

        {/* Language Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Language</h2>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="language">
              Preferred Language
            </label>
            <select
              id="language"
              className={styles.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              {/* Add more languages as needed */}
            </select>
          </div>
        </div>

        {/* Appearance Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Appearance</h2>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              Enable Dark Mode
            </label>
          </div>
        </div>

        {/* Save Button */}
        <button type="submit" className={styles.saveButton}>Save Settings</button>
      </form>
    </Layout>
  );
};

export default Settings;
