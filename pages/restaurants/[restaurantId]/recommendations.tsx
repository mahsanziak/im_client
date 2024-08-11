import React from 'react';
import Layout from '../../../components/Layout';
import styles from '../../../styles/Recommendations.module.css';

const Recommendations: React.FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.header}>Recommendations</h1>
        <div className={styles.content}>
          <h2 className={styles.subHeader}>Coming Soon!</h2>
          <p className={styles.description}>
            We are currently collecting and analyzing data to bring you personalized recommendations. 
            Please check back later as we work hard to deliver insights that will help optimize your operations.
          </p>
          <div className={styles.iconContainer}>
            <i className={`fas fa-chart-line ${styles.icon}`}></i>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Recommendations;
