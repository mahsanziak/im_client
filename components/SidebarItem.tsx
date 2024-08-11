// components/SidebarItem.tsx
import React from 'react';
import Link from 'next/link';
import sidebarStyles from '../styles/sidebar.module.css';

interface SidebarItemProps {
  href: string;
  title: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, title }) => {
  return (
    <li className={sidebarStyles.navItem}>
      <Link href={href} className={sidebarStyles.navLink}>
        {title}
      </Link>
    </li>
  );
};

export default SidebarItem;
