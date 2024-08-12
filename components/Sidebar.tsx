import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import sidebarStyles from '../styles/sidebar.module.css';
import { supabase } from '../utils/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchRestaurantData = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, location')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant data:', error.message);
      } else if (data) {
        setRestaurantName(data.name);
        setLocation(data.location);
      }

      setLoading(false); // Set loading to false once data is fetched
    };

    if (restaurantId) {
      fetchRestaurantData();
    } else {
      setLoading(false); // If no restaurantId, set loading to false
    }
  }, [restaurantId]);

  if (loading) {
    return null; // Don't render anything while loading
  }

  return (
    <div>
      <div className={`${sidebarStyles.sidebar} ${isOpen ? sidebarStyles.sidebarOpen : sidebarStyles.sidebarClosed}`}>
        <div className={sidebarStyles.header}>
          {isOpen ? (
            <>
              <div className={sidebarStyles.franchiseeName}>{restaurantName || 'Franchise Name'}</div>
              <div className={sidebarStyles.location}>{location || 'Location'}</div>
            </>
          ) : (
            <i className="fas fa-utensils text-2xl"></i>
          )}
        </div>
        <ul className={sidebarStyles.menu}>
          <li>
            <Link href={`/restaurants/${restaurantId}/overview`} legacyBehavior>
              <a className={sidebarStyles.menuItem}>
                <i className="fas fa-home"></i>
                {isOpen && <span className={sidebarStyles.menuText}>Overview</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/request-order`} legacyBehavior>
              <a className={sidebarStyles.menuItem}>
                <i className="fas fa-shopping-cart"></i>
                {isOpen && <span className={sidebarStyles.menuText}>Request Order</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/orders`} legacyBehavior>
              <a className={sidebarStyles.menuItem}>
                <i className="fas fa-list"></i>
                {isOpen && <span className={sidebarStyles.menuText}>Orders</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/billing`} legacyBehavior>
              <a className={sidebarStyles.menuItem}>
                <i className="fas fa-file-invoice-dollar"></i>
                {isOpen && <span className={sidebarStyles.menuText}>Billing</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/recommendations`} legacyBehavior>
              <a className={sidebarStyles.menuItem}>
                <i className="fas fa-lightbulb"></i>
                {isOpen && <span className={sidebarStyles.menuText}>Recommendations</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/restaurants/${restaurantId}/settings`} legacyBehavior>
              <a className={sidebarStyles.menuItem}>
                <i className="fas fa-cog"></i>
                {isOpen && <span className={sidebarStyles.menuText}>Settings</span>}
              </a>
            </Link>
          </li>
        </ul>
      </div>

      <div className={sidebarStyles.toggleButton} onClick={toggleSidebar}>
        <button className={sidebarStyles.button}>
          <i className={`fas ${isOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
