import styles from './admin-responsive.module.css';

export default function AdminLayout({ children }) {
  return <div className={styles.adminRoot}>{children}</div>;
}
